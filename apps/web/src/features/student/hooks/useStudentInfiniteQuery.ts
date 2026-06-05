import { useInfiniteQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Student } from '@tutorhub/database';
import { fetchStudents } from '../api/student-api';

export function useStudentInfiniteQuery() {
  const query = useInfiniteQuery({
    queryKey: ['students'],
    queryFn: ({ pageParam }) => fetchStudents({ cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 30_000,
  });

  /** All loaded items flattened across pages */
  const items = computed<Student[]>(
    () => query.data.value?.pages.flatMap((page) => page.items) ?? [],
  );

  /** Total count from the first page response (0 until first load) */
  const total = computed<number>(() => query.data.value?.pages[0]?.total ?? 0);

  return {
    items,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: computed(() => query.hasNextPage.value ?? false),
    fetchNextPage: query.fetchNextPage,
    error: computed(() => {
      if (query.error.value) {
        return query.error.value instanceof Error
          ? query.error.value.message
          : 'Failed to load students';
      }
      return '';
    }),
  };
}
