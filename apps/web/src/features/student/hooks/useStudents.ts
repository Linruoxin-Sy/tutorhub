import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listStudents } from '../api';

export function useStudents(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  userId: Ref<string>;
  q: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'students',
      params.page.value,
      params.pageSize.value,
      params.userId.value,
      params.q.value,
    ]),
    queryFn: () =>
      listStudents({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        userId: unref(params.userId) || undefined,
        q: unref(params.q) || undefined,
      }),
  });
}
