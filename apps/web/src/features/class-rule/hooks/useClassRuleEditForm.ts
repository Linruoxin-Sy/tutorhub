import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { cloneDeep, merge } from 'es-toolkit';
import { RRule, type Options as RRuleOptions } from 'rrule';
import { toast } from 'vue-sonner';

import { classRuleUpdateSchema, type ConflictItem, type GeneratedSession } from '@tutorhub/schema';

import {
  checkClassRuleConflicts,
  fetchClassRuleById,
  updateClassRule,
} from '@/features/class-rule/api/class-rule-api';
import { useLoading } from '@/hooks/useLoading';

import type { ClassRuleFormData } from './useClassRuleCreateForm';

export function useClassRuleEditForm(enrollmentId: string, ruleId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isInitialLoading = ref(true);

  const formData = ref<ClassRuleFormData>({
    studentCourseId: enrollmentId,
    startDate: '',
    startTime: '',
    endTime: '',
    intervalDays: null,
    endDate: '',
  });

  /** 表单校验状态 */
  const isValidated = ref(false);

  /** 冲突检测结果 */
  const conflictResult = ref<{ hasConflict: boolean; conflicts: ConflictItem[] } | null>(null);

  /** 生成的课程列表 */
  const generatedSessions = ref<GeneratedSession[]>([]);

  /** 当前显示的课程批次索引 */
  const sessionBatchIndex = ref(0);
  const BATCH_SIZE = 50;

  const displayedSessions = computed(() =>
    generatedSessions.value.slice(0, (sessionBatchIndex.value + 1) * BATCH_SIZE),
  );

  const hasMoreSessions = computed(
    () => displayedSessions.value.length < generatedSessions.value.length,
  );

  /** 是否无限循环 */
  const isInfinite = computed(
    () => formData.value.intervalDays !== null && !formData.value.endDate,
  );

  /** 表单填写是否完成 */
  const isFormComplete = computed(() => {
    if (!formData.value.startDate || !formData.value.startTime || !formData.value.endTime) {
      return false;
    }
    return true;
  });

  // 加载已有数据
  onMounted(async () => {
    try {
      const rule = await fetchClassRuleById(ruleId);
      formData.value = {
        studentCourseId: enrollmentId,
        startDate: dayjs(rule.startDate as string).format('YYYY-MM-DD'),
        startTime: dayjs(rule.startTime as string).format('HH:mm'),
        endTime: dayjs(rule.endTime as string).format('HH:mm'),
        intervalDays: (rule.intervalDays as number | null) ?? null,
        endDate: rule.endDate ? dayjs(rule.endDate as string).format('YYYY-MM-DD') : '',
      };
    } catch {
      toast.error('Failed to load class rule data');
      router.push({ name: 'enrollment.detail', params: { id: enrollmentId } });
    } finally {
      isInitialLoading.value = false;
    }
  });

  /** 表单校验 */
  const verify = (): boolean => {
    const payload = {
      startDate: formData.value.startDate,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate || null,
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

  /** 冲突检测 */
  const checkConflicts = async (): Promise<boolean> => {
    const payload = {
      excludeId: ruleId,
      startDate: new Date(formData.value.startDate),
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate ? new Date(formData.value.endDate) : null,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
    };

    try {
      const res = await checkClassRuleConflicts(formData.value.studentCourseId, payload);
      conflictResult.value = res;
      return !res.hasConflict;
    } catch {
      toast.error('Failed to check conflicts');
      return false;
    }
  };

  /** 生成 session 列表 */
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

    generatedSessions.value = dates.map((d) => ({
      occurrenceDate: dayjs(d).format('YYYY-MM-DD'),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
    }));
  };

  /** 加载更多 session */
  const loadMoreSessions = () => {
    if (hasMoreSessions.value) {
      sessionBatchIndex.value++;
    }
  };

  /** 提交 */
  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;

    const hasNoConflict = await checkConflicts();
    if (!hasNoConflict) {
      generateSessions();
      return;
    }

    generateSessions();

    const payload = merge(cloneDeep(formData.value), {});
    const apiPayload = {
      startDate: payload.startDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      intervalDays: payload.intervalDays || null,
      endDate: payload.endDate || null,
    };

    await updateClassRule(ruleId, apiPayload);
    toast.success('Class rule updated successfully!');
    queryClient.invalidateQueries({ queryKey: ['class-rules', enrollmentId] });
    router.push({ name: 'enrollment.detail', params: { id: enrollmentId } });
  });

  return {
    formData,
    isInitialLoading,
    isValidated,
    conflictResult,
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
    submit,
  };
}
