import { useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, isEqual, isNil, mapValues, merge, pick } from 'es-toolkit';
import { toast } from 'vue-sonner';

import { courseUpdateSchema } from '@tutorhub/schema';

import { fetchCourseById, updateCourse } from '@/features/course/api/course-api';
import { useLoading } from '@/hooks/useLoading';

const DEFAULT_FORM_DATA = {
  name: '',
  description: '',
  status: 'ACTIVE' as const,
};

const FORM_DATA_KEYS = Object.keys(DEFAULT_FORM_DATA) as (keyof typeof DEFAULT_FORM_DATA)[];

type CourseFormData = typeof DEFAULT_FORM_DATA;

export function useCourseEditForm(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isInitialLoading = ref(true);

  const originalData = ref<CourseFormData>(cloneDeep(DEFAULT_FORM_DATA));

  const formData = ref<CourseFormData>(cloneDeep(DEFAULT_FORM_DATA));

  const hasChanged = computed(() => {
    return !isEqual(formData.value, originalData.value);
  });

  // Load existing course data
  onMounted(async () => {
    try {
      const course = await fetchCourseById(id);
      originalData.value = mapValues(
        pick(course, FORM_DATA_KEYS),
        (v) => (isNil(v) ? '' : v) as never,
      );
      formData.value = cloneDeep(originalData.value);
    } catch {
      toast.error('Failed to load course data');
      router.push('/course');
    } finally {
      isInitialLoading.value = false;
    }
  });

  const verify = (): boolean => {
    const result = courseUpdateSchema.safeParse(formData.value);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      return false;
    }
    return true;
  };

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;

    const payload = merge(cloneDeep(formData.value), {});
    await updateCourse(id, payload);
    toast.success('Course updated successfully!');
    queryClient.invalidateQueries({ queryKey: ['courses'] });
    router.push('/course');
  });

  return {
    formData,
    originalData,
    hasChanged,
    isInitialLoading,
    submit,
    isSubmitting,
  };
}
