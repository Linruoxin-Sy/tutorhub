import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listClassRules } from '../api';

export function useClassRules(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  studentCourseId: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'class-rules',
      params.page.value,
      params.pageSize.value,
      params.studentCourseId.value,
    ]),
    queryFn: () =>
      listClassRules({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        studentCourseId: unref(params.studentCourseId) || undefined,
      }),
  });
}
