import { cloneDeep, isNil, mapValues, pick } from 'es-toolkit';
import { toast } from 'vue-sonner';

import { fetchCourseById } from '@/features/course/api/course-api';
import {
  DEFAULT_FORM_DATA,
  FORM_DATA_KEYS,
  type CourseFormData,
} from '@/features/course/types/courseForm';

export function useCourseDetail(id: string) {
  const router = useRouter();

  const isInitialLoading = ref(true);

  const formData = ref<CourseFormData>(cloneDeep(DEFAULT_FORM_DATA));

  onMounted(async () => {
    try {
      const course = await fetchCourseById(id);
      formData.value = mapValues(pick(course, FORM_DATA_KEYS), (v) =>
        isNil(v) ? '' : v,
      ) as CourseFormData;
    } catch {
      toast.error('Failed to load course details');
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
