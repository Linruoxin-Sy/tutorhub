import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { toast } from 'vue-sonner';

import { classRuleUpdateSchema, type ConflictItem, type GeneratedSession } from '@tutorhub/schema';

import {
  applyClassRuleChanges,
  checkClassRuleConflicts,
  fetchClassRuleById,
  previewClassRuleChanges,
} from '@/features/class-rule/api/class-rule-api';
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

  const isValidated = ref(false);
  const conflictResult = ref<{ hasConflict: boolean; conflicts: ConflictItem[] } | null>(null);
  const generatedSessions = ref<GeneratedSession[]>([]);
  const sessionBatchIndex = ref(0);
  const BATCH_SIZE = 50;

  /** 预览数据（编辑场景：即将删除/创建的 session 数量） */
  const previewData = ref<{ toDelete: number; toCreate: number } | null>(null);

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
    return true;
  });

  // 声明空函数以满足返回类型
  const generateSessions = () => {};
  const loadMoreSessions = () => {};

  // 加载已有数据
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

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;

    // 预览变更
    try {
      const preview = await previewClassRuleChanges(ruleId);
      previewData.value = { toDelete: preview.toDelete, toCreate: preview.toCreate };
    } catch {
      // preview not critical
    }

    const hasNoConflict = await checkConflicts();
    if (!hasNoConflict) {
      return;
    }

    // 确认后应用变更
    const confirmed = window.confirm?.(
      previewData.value
        ? `This will delete ${previewData.value.toDelete} future session(s) and create ${previewData.value.toCreate} new session(s). Continue?`
        : 'Apply changes to this rule?',
    );

    if (confirmed === false) return;

    const payload = {
      startDate: dayjs(formData.value.startDate).toDate(),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      intervalDays: formData.value.intervalDays || null,
      endDate: formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null,
      room: formData.value.room || null,
    };

    await applyClassRuleChanges(ruleId, payload);
    toast.success('Class rule updated and sessions regenerated!');
    queryClient.invalidateQueries({ queryKey: ['course-class-rules', courseId] });
    router.push({ name: 'course.edit', params: { id: courseId } });
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
