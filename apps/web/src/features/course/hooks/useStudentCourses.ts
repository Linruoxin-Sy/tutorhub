import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listStudentCourses } from '../api';

export function useStudentCourses(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  studentId: Ref<string>;
  courseId: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'student-courses',
      params.page.value,
      params.pageSize.value,
      params.studentId.value,
      params.courseId.value,
    ]),
    queryFn: () =>
      listStudentCourses({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        studentId: unref(params.studentId) || undefined,
        courseId: unref(params.courseId) || undefined,
      }),
  });
}
