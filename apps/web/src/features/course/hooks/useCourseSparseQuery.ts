import { useQuery, useQueryClient } from '@tanstack/vue-query';
import pLimit from 'p-limit';
import { computed, readonly, ref, watch, watchEffect } from 'vue';

import type { Course } from '@tutorhub/database';

import { fetchCourses, type CourseListResponse } from '../api/course-api';

const PAGE_SIZE = 20;
const QUERY_KEY_PREFIX = ['courses', 'offset'];

/**
 * 基于 offset 分页 + TanStack Query 缓存的稀疏数据查询。
 *
 * 与 student 实现一致，只是将 student 替换为 course。
 */
export function useCourseSparseQuery() {
  const queryClient = useQueryClient();
  const total = ref(0);
  const version = ref(0);

  function getItem(index: number): Course | undefined {
    void version.value;
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    const data = queryClient.getQueryData<CourseListResponse>([...QUERY_KEY_PREFIX, offset]);
    return data?.items[index - offset];
  }

  function isLoaded(index: number): boolean {
    void version.value;
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    return !!queryClient.getQueryData([...QUERY_KEY_PREFIX, offset]);
  }

  async function ensureRange(startIdx: number, endIdx: number): Promise<void> {
    const s = Math.max(0, Math.floor(startIdx / PAGE_SIZE) * PAGE_SIZE);
    const e = Math.min(total.value || Infinity, Math.ceil((endIdx + 1) / PAGE_SIZE) * PAGE_SIZE);

    const missing: number[] = [];
    for (let offset = s; offset < e; offset += PAGE_SIZE) {
      if (!queryClient.getQueryData([...QUERY_KEY_PREFIX, offset])) {
        missing.push(offset);
      }
    }

    if (missing.length === 0) return;

    const CONCURRENCY = 4;
    const limit = pLimit(CONCURRENCY);
    const promises = missing.map((offset) =>
      limit(() =>
        queryClient.prefetchQuery({
          queryKey: [...QUERY_KEY_PREFIX, offset],
          queryFn: () => fetchCourses({ offset, limit: PAGE_SIZE }),
          staleTime: 30_000,
        }),
      ),
    );

    for (let i = 0; i < promises.length; i += CONCURRENCY) {
      await Promise.all(promises.slice(i, i + CONCURRENCY));
      version.value++;
    }
  }

  const firstPageQuery = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, 0],
    queryFn: () => fetchCourses({ offset: 0, limit: PAGE_SIZE }),
    staleTime: 30_000,
  });

  watchEffect(() => {
    if (firstPageQuery.data.value) {
      total.value = firstPageQuery.data.value.total;
      version.value++;
    }
  });

  watch(total, (t) => {
    if (t > 0) {
      ensureRange(0, t - 1);
    }
  });

  const displayError = computed(() => {
    if (firstPageQuery.error.value) {
      return firstPageQuery.error.value instanceof Error
        ? firstPageQuery.error.value.message
        : 'Failed to load courses';
    }
    return '';
  });

  return {
    getItem,
    isLoaded,
    total: readonly(total),
    isLoading: computed(() => firstPageQuery.isLoading.value),
    error: readonly(displayError),
    ensureRange,
  };
}
