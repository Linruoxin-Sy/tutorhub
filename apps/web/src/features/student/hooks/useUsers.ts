import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listUsers } from '../api';

export function useUsers(params: { page: Ref<number>; pageSize: Ref<number>; q: Ref<string> }) {
  return useQuery({
    queryKey: computed(() => ['users', params.page.value, params.pageSize.value, params.q.value]),
    queryFn: () =>
      listUsers({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        q: unref(params.q) || undefined,
      }),
  });
}
