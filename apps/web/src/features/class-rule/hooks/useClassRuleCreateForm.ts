import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { cloneDeep, merge } from 'es-toolkit';
import rrulePkg from 'rrule';
import { toast } from 'vue-sonner';

import { classRuleCreateSchema, type ConflictItem, type GeneratedSession } from '@tutorhub/schema';

import { checkClassRuleConflicts, createClassRule } from '@/features/class-rule/api/class-rule-api';
import { useLoading } from '@/hooks/useLoading';

const { RRule } = rrulePkg;

export interface ClassRuleFormData {
  studentCourseId: string;
  startDate: string;
  startTime: string;
  endTime: string;
  intervalDays: number | null;
  endDate: string;
}

export const DEFAULT_FORM_DATA: ClassRuleFormData = {
  studentCourseId: '',
  startDate: '',
  startTime: '',
  endTime: '',
  intervalDays: null,
  endDate: '',
};

export function useClassRuleCreateForm(enrollmentId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formData = ref<ClassRuleFormData>({
    ...cloneDeep(DEFAULT_FORM_DATA),
    studentCourseId: enrollmentId,
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

  /** 是否可以进入下一步（表单填写完成） */
  const isFormComplete = computed(() => {
    if (!formData.value.startDate || !formData.value.startTime || !formData.value.endTime) {
      return false;
    }
    if (formData.value.intervalDays !== null && !formData.value.endDate && !isInfinite.value) {
      return false;
    }
    return true;
  });

  /** 表单数据合法性验证 */
  const verify = (): boolean => {
    const payload = {
      studentCourseId: formData.value.studentCourseId,
      startDate: formData.value.startDate,
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate || null,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
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

  /** 冲突检测 */
  const checkConflicts = async (): Promise<boolean> => {
    const payload = {
      startDate: formData.value.startDate,
      intervalDays: formData.value.intervalDays,
      endDate: formData.value.endDate || null,
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
      // 单次课程
      dates = [startDate];
    } else {
      const rruleOptions: Partial<RRule.Options> = {
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
        // 无限循环：只生成前 365 天
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

    // 无冲突 → 生成 sessions 并提交
    generateSessions();

    const payload = merge(cloneDeep(formData.value), {});
    const apiPayload = {
      studentCourseId: payload.studentCourseId,
      startDate: payload.startDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
      intervalDays: payload.intervalDays || null,
      endDate: payload.endDate || null,
    };

    await createClassRule(apiPayload);
    toast.success('Class rule created successfully!');
    queryClient.invalidateQueries({ queryKey: ['class-rules', enrollmentId] });
    router.push({ name: 'enrollment.detail', params: { id: enrollmentId } });
  });

  return {
    formData,
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
