import { useQuery, useQueryClient } from '@tanstack/vue-query';
import pLimit from 'p-limit';
import { computed, readonly, ref, watch, watchEffect } from 'vue';

import { fetchStudents, type StudentListResponse } from '../api/student-api';

type StudentItem = StudentListResponse['items'][number];

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

  function getItem(index: number): StudentItem | undefined {
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

    // 使用 p-limit 控制并发数，避免瞬间发起大量请求
    const CONCURRENCY = 4;
    const limit = pLimit(CONCURRENCY);
    const promises = missing.map((offset) =>
      limit(() =>
        queryClient.prefetchQuery({
          queryKey: [...QUERY_KEY_PREFIX, offset],
          queryFn: () => fetchStudents({ offset, limit: PAGE_SIZE }),
          staleTime: 30_000,
        }),
      ),
    );

    // 每批加载完成后递增版本戳，触发模板重新渲染
    for (let i = 0; i < promises.length; i += CONCURRENCY) {
      await Promise.all(promises.slice(i, i + CONCURRENCY));
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

  // total 确定后立即预取所有页面，避免因虚拟列表 watch 时机不可靠导致页面未加载
  watch(total, (t) => {
    if (t > 0) {
      ensureRange(0, t - 1);
    }
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
    isLoading: computed(() => firstPageQuery.isLoading.value),
    error: readonly(displayError),
    ensureRange,
  };
}
