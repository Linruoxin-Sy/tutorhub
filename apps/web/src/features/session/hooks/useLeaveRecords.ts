import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listLeaveRecords } from '../api';

export function useLeaveRecords(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  classSessionId: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'leave-records',
      params.page.value,
      params.pageSize.value,
      params.classSessionId.value,
    ]),
    queryFn: () =>
      listLeaveRecords({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        classSessionId: unref(params.classSessionId) || undefined,
      }),
  });
}
