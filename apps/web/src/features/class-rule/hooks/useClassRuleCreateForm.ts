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
  name: string;
  price: number | null;
  room: string;
}

export const DEFAULT_FORM_DATA: ClassRuleFormData = {
  courseId: '',
  startDate: '',
  startTime: '',
  endTime: '',
  intervalDays: null,
  endDate: '',
  name: '',
  price: null,
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
      name: formData.value.name,
      price: formData.value.price,
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

  /** 生成初始一批 session（后续通过 ensureRange 自动追加） */
  const generateSessions = () => {
    generatedSessions.value = [];
    sessionWindowEnd.value = null;
    hasMoreRef.value = true;

    const startDate = dayjs(formData.value.startDate).toDate();
    const intervalDays = formData.value.intervalDays;
    const endDate = formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null;

    if (!intervalDays) {
      // 单次上课，直接生成
      generatedSessions.value.push({
        id: `session_create_${courseId}_0`,
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

    appendSessionChunk(
      startDate,
      intervalDays,
      endDate,
      formData.value.startTime,
      formData.value.endTime,
    );
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

    // 计算新窗口
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
        id: `session_create_${courseId}_${dateStr}_${startIdx + i}`,
        occurrenceDate: dateStr,
        startTime,
        endTime,
        status: computeSessionStatus(dateStr, startTime, endTime),
      });
    }

    sessionWindowEnd.value = newWindowEnd;

    // 有限规则且已到达终点
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

  /** Phase 2: Create */
  const doCreate = withLoading(async () => {
    if (!verify()) return;

    const apiPayload = {
      courseId: formData.value.courseId,
      startDate: new Date(formData.value.startDate),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      intervalDays: formData.value.intervalDays || null,
      endDate: formData.value.endDate ? new Date(formData.value.endDate) : null,
      name: formData.value.name,
      price: formData.value.price,
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
    sessionQuery,
    isFormComplete,
    isInfinite,
    isSubmitting,
    verify,
    checkConflicts,
    generateSessions,
    runConflictCheck,
    doCreate,
  };
}
