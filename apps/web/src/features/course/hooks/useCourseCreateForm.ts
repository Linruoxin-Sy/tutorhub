import { cloneDeep, merge } from 'es-toolkit';
import { courseCreateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { createCourse } from '@/features/course/api/course-api';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const DEFAULT_FORM_DATA = {
  name: '',
  description: '',
  status: 'ACTIVE' as const,
};

type CourseFormData = typeof DEFAULT_FORM_DATA;

export function useCourseCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formData = ref<CourseFormData>(cloneDeep(DEFAULT_FORM_DATA));

  const verify = (): boolean => {
    const result = courseCreateSchema.safeParse(formData.value);
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
    await createCourse(payload);
    toast.success('Course created successfully!');
    queryClient.invalidateQueries({ queryKey: ['courses'] });
    router.push('/course');
  });

  return {
    data: formData,
    submit,
    isSubmitting,
  };
}
