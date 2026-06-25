import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { cloneDeep } from 'es-toolkit';
import { RRule, type Options as RRuleOptions } from 'rrule';
import { toast } from 'vue-sonner';

import { classRuleCreateSchema, type ConflictItem, type GeneratedSession } from '@tutorhub/schema';

import { checkClassRuleConflicts, createClassRule } from '@/features/class-rule/api/class-rule-api';
import { computeSessionStatus } from '@/features/session/utils/sessionStatus';
import { useLoading } from '@/hooks/useLoading';

export interface ClassRuleFormData {
  courseId: string;
  startDate: string;
  startTime: string;
  endTime: string;
  intervalDays: number | null;
  endDate: string;
  room: string;
}

export const DEFAULT_FORM_DATA: ClassRuleFormData = {
  courseId: '',
  startDate: '',
  startTime: '',
  endTime: '',
  intervalDays: null,
  endDate: '',
  room: '',
};

export function useClassRuleCreateForm(courseId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formData = ref<ClassRuleFormData>({
    ...cloneDeep(DEFAULT_FORM_DATA),
    courseId,
  });

  const isValidated = ref(false);
  const conflictResult = ref<{ hasConflict: boolean; conflicts: ConflictItem[] } | null>(null);
  const conflictPassed = ref(false);
  const generatedSessions = ref<GeneratedSession[]>([]);
  const sessionBatchIndex = ref(0);
  const BATCH_SIZE = 50;

  const displayedSessions = computed(() =>
    generatedSessions.value.slice(0, (sessionBatchIndex.value + 1) * BATCH_SIZE),
  );

  const hasMoreSessions = computed(
    () => displayedSessions.value.length < generatedSessions.value.length,
  );

  const isInfinite = computed(
    () => formData.value.intervalDays !== null && !formData.value.endDate,
  );

  const isFormComplete = computed(() => {
    if (!formData.value.startDate || !formData.value.startTime || !formData.value.endTime) {
      return false;
    }
    if (formData.value.intervalDays !== null && !formData.value.endDate && !isInfinite.value) {
      return false;
    }
    return true;
  });

  // Reset conflict pass when form changes after conflict check
  watch(
    formData,
    () => {
      if (conflictPassed.value) {
        conflictPassed.value = false;
        conflictResult.value = null;
        generatedSessions.value = [];
      }
    },
    { deep: true },
  );

  const verify = (): boolean => {
    const payload = {
      courseId: formData.value.courseId,
      startDate: formData.value.startDate,
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate || null,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      room: formData.value.room || null,
    };

    const result = classRuleCreateSchema.safeParse(payload);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      isValidated.value = false;
      return false;
    }

    isValidated.value = true;
    return true;
  };

  const checkConflicts = async (): Promise<boolean> => {
    const payload = {
      courseId: formData.value.courseId,
      startDate: new Date(formData.value.startDate),
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate ? new Date(formData.value.endDate) : null,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      room: formData.value.room || null,
    };

    try {
      const res = await checkClassRuleConflicts(payload);
      conflictResult.value = res;
      return !res.hasConflict;
    } catch {
      toast.error('Failed to check conflicts');
      return false;
    }
  };

  const generateSessions = () => {
    generatedSessions.value = [];
    sessionBatchIndex.value = 0;

    const startDate = dayjs(formData.value.startDate).toDate();
    const intervalDays = formData.value.intervalDays;
    const endDate = formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null;

    let dates: Date[];

    if (!intervalDays) {
      dates = [startDate];
    } else {
      const rruleOptions: Partial<RRuleOptions> = {
        freq: RRule.DAILY,
        interval: intervalDays,
        dtstart: new Date(
          Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
        ),
      };

      if (endDate) {
        rruleOptions.until = new Date(
          Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
        );
      }

      const rule = new RRule(rruleOptions);

      if (endDate) {
        dates = rule.between(startDate, endDate, true);
      } else {
        const maxDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        dates = rule.between(startDate, maxDate, true);
      }
    }

    generatedSessions.value = dates.map((d, i) => {
      const dateStr = dayjs(d).format('YYYY-MM-DD');
      return {
        id: `session_create_${courseId}_${dateStr}_${i}`,
        occurrenceDate: dateStr,
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        status: computeSessionStatus(dateStr, formData.value.startTime, formData.value.endTime),
      };
    });
  };

  const loadMoreSessions = () => {
    if (hasMoreSessions.value) {
      sessionBatchIndex.value++;
    }
  };

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();

  /** Phase 1: Conflict check */
  const runConflictCheck = withLoading(async (): Promise<boolean> => {
    if (!verify()) return false;
    conflictPassed.value = false;

    const hasNoConflict = await checkConflicts();
    if (hasNoConflict) {
      toast.success('No conflicts detected, sessions generated');
      generateSessions();
      conflictPassed.value = true;
    }
    return hasNoConflict;
  });

  /** Phase 2: Create */
  const doCreate = withLoading(async () => {
    if (!verify()) return;

    const apiPayload = {
      courseId: formData.value.courseId,
      startDate: dayjs(formData.value.startDate).toDate(),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      intervalDays: formData.value.intervalDays || null,
      endDate: formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null,
      room: formData.value.room || null,
    };

    await createClassRule(apiPayload);
    toast.success('Class rule created successfully!');
    queryClient.invalidateQueries({ queryKey: ['course-class-rules', courseId] });
    router.push({ name: 'course.edit', params: { id: courseId } });
  });

  return {
    formData,
    isValidated,
    conflictResult,
    conflictPassed,
    generatedSessions,
    displayedSessions,
    hasMoreSessions,
    isFormComplete,
    isInfinite,
    isSubmitting,
    verify,
    checkConflicts,
    generateSessions,
    loadMoreSessions,
    runConflictCheck,
    doCreate,
  };
}
