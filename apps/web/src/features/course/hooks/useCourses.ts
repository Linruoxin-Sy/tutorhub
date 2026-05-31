import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listCourses, type CourseStatus } from '../api';

export function useCourses(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  q: Ref<string>;
  status: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'courses',
      params.page.value,
      params.pageSize.value,
      params.q.value,
      params.status.value,
    ]),
    queryFn: () =>
      listCourses({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        q: unref(params.q) || undefined,
        status: (unref(params.status) || undefined) as CourseStatus | undefined,
      }),
  });
}
