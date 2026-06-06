import { computed, readonly, ref, watchEffect } from 'vue';
import { useQueryClient, useQuery } from '@tanstack/vue-query';
import type { Student } from '@tutorhub/database';
import { fetchStudents, type StudentListResponse } from '../api/student-api';

const PAGE_SIZE = 20;
const QUERY_KEY_PREFIX = ['students', 'offset'];

/**
 * 基于 offset 分页 + TanStack Query 缓存的稀疏数据查询。
 *
 * 与 cursor 分页不同，offset 分页允许直接跳转到任意索引位置加载数据，
 * 配合 virtual scroll 可以实现「滑到哪就加载哪」的体验。
 *
 * 内部以 `['students', 'offset', N]` 为 key 将每页数据存入 Query 缓存，
 * 滚动时自动 pre-fetch 缺失的页面，已有的页面直接通过 getQueryData 读取。
 */
export function useStudentSparseQuery() {
  const queryClient = useQueryClient();
  const total = ref(0);
  /** 版本戳 — 每次预取完成后递增，驱动模板响应式重渲染 */
  const version = ref(0);

  // ── 从缓存中读取指定索引的数据 ──

  function getItem(index: number): Student | undefined {
    void version.value; // 建立响应式依赖
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    const data = queryClient.getQueryData<StudentListResponse>([...QUERY_KEY_PREFIX, offset]);
    return data?.items[index - offset];
  }

  function isLoaded(index: number): boolean {
    void version.value; // 建立响应式依赖
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    return !!queryClient.getQueryData([...QUERY_KEY_PREFIX, offset]);
  }

  // ── 预取指定范围内的页面 ──

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

    // 分批并发，避免瞬间发起大量请求
    const CONCURRENCY = 4;
    for (let i = 0; i < missing.length; i += CONCURRENCY) {
      const batch = missing.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map((offset) =>
          queryClient.prefetchQuery({
            queryKey: [...QUERY_KEY_PREFIX, offset],
            queryFn: () => fetchStudents({ offset, limit: PAGE_SIZE }),
            staleTime: 30_000,
          }),
        ),
      );
      // 每批加载完成后递增版本戳，触发模板重新渲染
      version.value++;
    }
  }

  // ── 加载第一页获取 total ──

  const firstPageQuery = useQuery({
    queryKey: [...QUERY_KEY_PREFIX, 0],
    queryFn: () => fetchStudents({ offset: 0, limit: PAGE_SIZE }),
    staleTime: 30_000,
  });

  watchEffect(() => {
    if (firstPageQuery.data.value) {
      total.value = firstPageQuery.data.value.total;
      version.value++; // 第一页数据就绪后触发重渲染
    }
  });

  /** 当前已加载的总行数（用于底部状态栏） */
  const loadedCount = computed(() => {
    const allQueries = queryClient.getQueryCache().findAll({
      queryKey: QUERY_KEY_PREFIX,
    });
    return allQueries.reduce((sum, query) => {
      const data = query.state.data as StudentListResponse | undefined;
      return sum + (data?.items.length ?? 0);
    }, 0);
  });

  // 错误状态
  const displayError = computed(() => {
    if (firstPageQuery.error.value) {
      return firstPageQuery.error.value instanceof Error
        ? firstPageQuery.error.value.message
        : 'Failed to load students';
    }
    return '';
  });

  return {
    getItem,
    isLoaded,
    total: readonly(total),
    loadedCount,
    isLoading: computed(() => firstPageQuery.isLoading.value),
    isFetching: computed(() => queryClient.isFetching({ queryKey: QUERY_KEY_PREFIX }) > 0),
    error: readonly(displayError),
    ensureRange,
  };
}
