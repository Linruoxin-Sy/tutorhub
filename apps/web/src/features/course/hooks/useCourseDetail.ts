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
  const createdAt = ref<Date | string | null>(null);
  const updatedAt = ref<Date | string | null>(null);

  onMounted(async () => {
    try {
      const course = await fetchCourseById(id);
      formData.value = mapValues(pick(course, FORM_DATA_KEYS), (v) =>
        isNil(v) ? '' : v,
      ) as CourseFormData;
      createdAt.value = course.createdAt;
      updatedAt.value = course.updatedAt;
    } catch {
      toast.error('Failed to load course details');
      router.push({ name: 'course.list' });
    } finally {
      isInitialLoading.value = false;
    }
  });

  return {
    data: formData,
    createdAt,
    updatedAt,
    isInitialLoading,
  };
}
