import { useQuery, useQueryClient } from '@tanstack/vue-query';
import pLimit from 'p-limit';
import { computed, readonly, ref, watch, watchEffect, type Ref } from 'vue';

import type { Course } from '@tutorhub/database';

import { fetchCourses, type CourseListResponse } from '../api/course-api';

const PAGE_SIZE = 20;

/**
 * 基于 offset 分页 + TanStack Query 缓存的稀疏数据查询。
 *
 * 支持按课程名称搜索和按状态筛选，筛选条件变化时自动重置缓存。
 */
export function useCourseSparseQuery(filters?: {
  searchTerm?: Ref<string>;
  statusTerm?: Ref<string>;
}) {
  const queryClient = useQueryClient();
  const total = ref(0);
  const version = ref(0);
  const currentSearch = ref('');
  const currentStatus = ref('');
  const isResetting = ref(false);

  function queryKeyPrefix(): (string | number)[] {
    const parts = ['courses'];
    if (currentSearch.value) parts.push(currentSearch.value);
    if (currentStatus.value) parts.push(`status:${currentStatus.value}`);
    parts.push('offset');
    return parts;
  }

  function getItem(index: number): Course | undefined {
    void version.value;
    const prefix = queryKeyPrefix();
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    const data = queryClient.getQueryData<CourseListResponse>([...prefix, offset]);
    return data?.items[index - offset];
  }

  function isLoaded(index: number): boolean {
    void version.value;
    const prefix = queryKeyPrefix();
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    return !!queryClient.getQueryData([...prefix, offset]);
  }

  async function ensureRange(startIdx: number, endIdx: number): Promise<void> {
    const prefix = queryKeyPrefix();
    const s = Math.max(0, Math.floor(startIdx / PAGE_SIZE) * PAGE_SIZE);
    const e = Math.min(total.value || Infinity, Math.ceil((endIdx + 1) / PAGE_SIZE) * PAGE_SIZE);

    const missing: number[] = [];
    for (let offset = s; offset < e; offset += PAGE_SIZE) {
      if (!queryClient.getQueryData([...prefix, offset])) {
        missing.push(offset);
      }
    }

    if (missing.length === 0) return;

    const nameArg = currentSearch.value || undefined;
    const statusArg = currentStatus.value || undefined;

    const CONCURRENCY = 4;
    const limit = pLimit(CONCURRENCY);
    const promises = missing.map((offset) =>
      limit(() =>
        queryClient.prefetchQuery({
          queryKey: [...prefix, offset],
          queryFn: () =>
            fetchCourses({ offset, limit: PAGE_SIZE, name: nameArg, status: statusArg }),
          staleTime: 30_000,
        }),
      ),
    );

    for (let i = 0; i < promises.length; i += CONCURRENCY) {
      await Promise.all(promises.slice(i, i + CONCURRENCY));
      version.value++;
    }
  }

  // 监听 filter 变化，重置缓存
  function resetFilters() {
    const oldPrefix = queryKeyPrefix();
    queryClient.removeQueries({ queryKey: oldPrefix, exact: false });

    isResetting.value = true;
    total.value = 0;
    version.value++;
    isResetting.value = false;
  }

  if (filters?.searchTerm) {
    watch(
      filters.searchTerm,
      (val) => {
        const trimmed = val?.trim() ?? '';
        if (trimmed === currentSearch.value) return;
        currentSearch.value = trimmed;
        resetFilters();
      },
      { immediate: true },
    );
  }

  if (filters?.statusTerm) {
    watch(
      filters.statusTerm,
      (val) => {
        const v = val ?? '';
        if (v === currentStatus.value) return;
        currentStatus.value = v;
        resetFilters();
      },
      { immediate: true },
    );
  }

  const prefix = computed(() => queryKeyPrefix());

  const firstPageQuery = useQuery({
    queryKey: computed(() => [...prefix.value, 0]),
    queryFn: () => {
      const nameArg = currentSearch.value || undefined;
      const statusArg = currentStatus.value || undefined;
      return fetchCourses({ offset: 0, limit: PAGE_SIZE, name: nameArg, status: statusArg });
    },
    staleTime: 30_000,
  });

  watchEffect(() => {
    if (firstPageQuery.data.value) {
      total.value = firstPageQuery.data.value.total;
      version.value++;
    }
  });

  watch(total, (t) => {
    if (t > 0 && !isResetting.value) {
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
