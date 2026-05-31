import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, unref } from 'vue';
import { listClassSessions } from '../api';

export function useClassSessions(params: {
  page: Ref<number>;
  pageSize: Ref<number>;
  studentCourseId: Ref<string>;
  classDate: Ref<string>;
}) {
  return useQuery({
    queryKey: computed(() => [
      'class-sessions',
      params.page.value,
      params.pageSize.value,
      params.studentCourseId.value,
      params.classDate.value,
    ]),
    queryFn: () =>
      listClassSessions({
        page: unref(params.page),
        pageSize: unref(params.pageSize),
        studentCourseId: unref(params.studentCourseId) || undefined,
        classDate: unref(params.classDate) || undefined,
      }),
  });
}
