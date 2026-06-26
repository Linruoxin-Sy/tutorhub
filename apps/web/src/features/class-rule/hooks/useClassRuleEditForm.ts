import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { cloneDeep, isEqual } from 'es-toolkit';
import { RRule, type Options as RRuleOptions } from 'rrule';
import { toast } from 'vue-sonner';

import { classRuleUpdateSchema, type ConflictItem, type GeneratedSession } from '@tutorhub/schema';

import {
  checkClassRuleConflicts,
  fetchClassRuleById,
  updateClassRule,
} from '@/features/class-rule/api/class-rule-api';
import { computeSessionStatus } from '@/features/session/utils/sessionStatus';
import { useLoading } from '@/hooks/useLoading';

import type { ClassRuleFormData } from './useClassRuleCreateForm';

export function useClassRuleEditForm(courseId: string, ruleId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isInitialLoading = ref(true);

  const formData = ref<ClassRuleFormData>({
    courseId,
    startDate: '',
    startTime: '',
    endTime: '',
    intervalDays: null,
    endDate: '',
    room: '',
  });

  const initialFormData = ref<ClassRuleFormData>(cloneDeep(formData.value));

  const hasChanges = computed(() => !isEqual(formData.value, initialFormData.value));

  const isValidated = ref(false);
  const conflictResult = ref<{ hasConflict: boolean; conflicts: ConflictItem[] } | null>(null);
  const conflictPassed = ref(false);
  const generatedSessions = ref<GeneratedSession[]>([]);
  const sessionWindowEnd = ref<Date | null>(null);
  const hasMoreRef = ref(false);
  const CHUNK_DAYS = 365;

  const isInfinite = computed(
    () => formData.value.intervalDays !== null && !formData.value.endDate,
  );

  const isFormComplete = computed(() => {
    if (!formData.value.startDate || !formData.value.startTime || !formData.value.endTime) {
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

  // Load existing data
  onMounted(async () => {
    try {
      const rule = await fetchClassRuleById(ruleId);
      formData.value = {
        courseId,
        startDate: dayjs(rule.startDate as string).format('YYYY-MM-DD'),
        startTime: dayjs(rule.startTime as string).format('HH:mm'),
        endTime: dayjs(rule.endTime as string).format('HH:mm'),
        intervalDays: (rule.intervalDays as number | null) ?? null,
        endDate: rule.endDate ? dayjs(rule.endDate as string).format('YYYY-MM-DD') : '',
        room: (rule.room as string) ?? '',
      };
      initialFormData.value = cloneDeep(formData.value);
    } catch {
      toast.error('Failed to load class rule data');
      router.push({ name: 'course.edit', params: { id: courseId } });
    } finally {
      isInitialLoading.value = false;
    }
  });

  const verify = (): boolean => {
    const payload = {
      startDate: formData.value.startDate,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate || null,
      room: formData.value.room || null,
    };

    const result = classRuleUpdateSchema.safeParse(payload);
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
      excludeId: ruleId,
      courseId,
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

  /** 生成初始一批 session（后续通过 ensureRange 自动追加） */
  const generateSessions = () => {
    generatedSessions.value = [];
    sessionWindowEnd.value = null;
    hasMoreRef.value = true;

    const startDate = dayjs(formData.value.startDate).toDate();
    const intervalDays = formData.value.intervalDays;
    const endDate = formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null;

    if (!intervalDays) {
      generatedSessions.value.push({
        id: `session_edit_${ruleId}_0`,
        occurrenceDate: formData.value.startDate,
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        status: computeSessionStatus(
          formData.value.startDate,
          formData.value.startTime,
          formData.value.endTime,
        ),
      });
      hasMoreRef.value = false;
      return;
    }

    appendSessionChunk(startDate, intervalDays, endDate, formData.value.startTime, formData.value.endTime);
  };

  /** 追加下一批 session */
  function appendSessionChunk(
    startDate: Date,
    intervalDays: number,
    endDate: Date | null,
    startTime: string,
    endTime: string,
  ) {
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

    const prevEnd = sessionWindowEnd.value ?? new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    const nextDay = new Date(prevEnd.getTime() + 24 * 60 * 60 * 1000);

    let newWindowEnd: Date;
    if (endDate) {
      const candidate = new Date(prevEnd.getTime() + CHUNK_DAYS * 24 * 60 * 60 * 1000);
      newWindowEnd = candidate > endDate ? endDate : candidate;
    } else {
      newWindowEnd = new Date(prevEnd.getTime() + CHUNK_DAYS * 24 * 60 * 60 * 1000);
    }

    const newDates = rule.between(nextDay, newWindowEnd, true);
    const startIdx = generatedSessions.value.length;

    for (let i = 0; i < newDates.length; i++) {
      const dateStr = dayjs(newDates[i]).format('YYYY-MM-DD');
      generatedSessions.value.push({
        id: `session_edit_${ruleId}_${dateStr}_${startIdx + i}`,
        occurrenceDate: dateStr,
        startTime,
        endTime,
        status: computeSessionStatus(dateStr, startTime, endTime),
      });
    }

    sessionWindowEnd.value = newWindowEnd;

    if (endDate && newWindowEnd >= endDate) {
      hasMoreRef.value = false;
    }
  }

  /** 暴露给 VirtualList 的 query（ensureRange 自动追加） */
  const sessionQuery = {
    getItem: (index: number): GeneratedSession | undefined => generatedSessions.value[index],
    isLoaded: () => true,
    total: computed(() => generatedSessions.value.length),
    isLoading: false,
    error: '',
    ensureRange: async (_start: number, end: number) => {
      if (end >= generatedSessions.value.length - 1 && hasMoreRef.value) {
        const startDate = dayjs(formData.value.startDate).toDate();
        const intervalDays = formData.value.intervalDays;
        const endDate = formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null;
        if (intervalDays) {
          appendSessionChunk(
            startDate,
            intervalDays,
            endDate,
            formData.value.startTime,
            formData.value.endTime,
          );
        }
      }
    },
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

  /** Phase 2: Update */
  const doUpdate = withLoading(async () => {
    if (!verify()) return;

    const payload = {
      startDate: dayjs(formData.value.startDate).toDate(),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      intervalDays: formData.value.intervalDays || null,
      endDate: formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null,
      room: formData.value.room || null,
    };

    await updateClassRule(ruleId, payload);
    toast.success('Class rule updated successfully!');
    queryClient.invalidateQueries({ queryKey: ['course-class-rules', courseId] });
    queryClient.invalidateQueries({ queryKey: ['class-session-overrides'] });
    router.push({ name: 'course.edit', params: { id: courseId } });
  });

  return {
    formData,
    hasChanges,
    isInitialLoading,
    isValidated,
    conflictResult,
    conflictPassed,
    generatedSessions,
    sessionQuery,
    isFormComplete,
    isInfinite,
    isSubmitting,
    verify,
    checkConflicts,
    generateSessions,
    runConflictCheck,
    doUpdate,
  };
}
