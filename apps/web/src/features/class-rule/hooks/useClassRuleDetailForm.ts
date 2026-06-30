import dayjs from 'dayjs';
import { cloneDeep } from 'es-toolkit';
import { toast } from 'vue-sonner';

import { fetchClassRuleById } from '@/features/class-rule/api/class-rule-api';
import {
  DEFAULT_FORM_DATA,
  type ClassRuleFormData,
} from '@/features/class-rule/types/classRuleForm';

export function useClassRuleDetailForm(ruleId: string) {
  const router = useRouter();

  const isInitialLoading = ref(true);

  const formData = ref<ClassRuleFormData>(cloneDeep(DEFAULT_FORM_DATA));

  onMounted(async () => {
    try {
      const rule = await fetchClassRuleById(ruleId);
      const raw = rule as Record<string, unknown>;

      formData.value = {
        name: (raw.name as string) ?? '',
        price: (raw.price as number | null) ?? null,
        startDate: dayjs(raw.startDate as string).format('YYYY-MM-DD'),
        startTime: dayjs(raw.startTime as string).format('HH:mm'),
        endTime: dayjs(raw.endTime as string).format('HH:mm'),
        intervalDays: (raw.intervalDays as number | null) ?? null,
        endDate: raw.endDate ? dayjs(raw.endDate as string).format('YYYY-MM-DD') : '',
        isRecurring: (raw.intervalDays as number | null) !== null,
      };
    } catch {
      toast.error('Failed to load class rule details');
      router.push({ name: 'course.list' });
    } finally {
      isInitialLoading.value = false;
    }
  });

  return {
    data: formData,
    isInitialLoading,
  };
}
