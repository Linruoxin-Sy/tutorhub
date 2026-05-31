import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listRescheduleRecords } from '../api';

export function useRescheduleRecords(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  originalSessionId: Ref<string>;
  newSessionId: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'reschedule-records',
      params.page.value,
      params.pageSize.value,
      params.originalSessionId.value,
      params.newSessionId.value,
    ]),
    queryFn: () =>
      listRescheduleRecords({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        originalSessionId: unref(params.originalSessionId) || undefined,
        newSessionId: unref(params.newSessionId) || undefined,
      }),
  });
}
