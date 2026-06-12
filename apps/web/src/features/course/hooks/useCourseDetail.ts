import { fetchCourseById } from '@/features/course/api/course-api';

export function useCourseDetail(id: string) {
  const router = useRouter();
  const course = ref<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  } | null>(null);

  const isInitialLoading = ref(true);
  const error = ref('');

  onMounted(async () => {
    try {
      course.value = await fetchCourseById(id);
    } catch {
      error.value = 'Failed to load course details';
      router.push({ name: 'course.list' });
    } finally {
      isInitialLoading.value = false;
    }
  });

  return {
    course,
    isInitialLoading,
    error,
  };
}
