import { useQuery, useQueryClient } from '@tanstack/vue-query';
import pLimit from 'p-limit';
import { computed, readonly, ref, watch, watchEffect, type Ref } from 'vue';

import { fetchStudents, type StudentListResponse } from '../api/student-api';

type StudentItem = StudentListResponse['items'][number];

const PAGE_SIZE = 20;

/**
 * 基于 offset 分页 + TanStack Query 缓存的稀疏数据查询。
 *
 * 支持按姓名搜索：传入 `searchTerm` ref，查询 key 自动包含搜索词，
 * 搜索词变化时清空旧缓存并重新加载第一页。
 */
export function useStudentSparseQuery(searchTerm?: Ref<string>) {
  const queryClient = useQueryClient();
  const total = ref(0);
  /** 版本戳 — 每次预取完成后递增，驱动模板响应式重渲染 */
  const version = ref(0);
  /** 当前搜索词快照，用于构建 query key */
  const currentSearch = ref('');
  /** 搜索变化时是否正在重置中，避免重复触发 */
  const isResetting = ref(false);

  // 构建查询 key 前缀，搜索词不同则缓存隔离
  function queryKeyPrefix(): (string | number)[] {
    return currentSearch.value
      ? ['students', currentSearch.value, 'offset']
      : ['students', '', 'offset'];
  }

  // ── 从缓存中读取指定索引的数据 ──

  function getItem(index: number): StudentItem | undefined {
    void version.value; // 建立响应式依赖
    const prefix = queryKeyPrefix();
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    const data = queryClient.getQueryData<StudentListResponse>([...prefix, offset]);
    return data?.items[index - offset];
  }

  function isLoaded(index: number): boolean {
    void version.value; // 建立响应式依赖
    const prefix = queryKeyPrefix();
    const offset = Math.floor(index / PAGE_SIZE) * PAGE_SIZE;
    return !!queryClient.getQueryData([...prefix, offset]);
  }

  // ── 预取指定范围内的页面 ──

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

    // 使用 p-limit 控制并发数，避免瞬间发起大量请求
    const CONCURRENCY = 4;
    const limit = pLimit(CONCURRENCY);
    const promises = missing.map((offset) =>
      limit(() =>
        queryClient.prefetchQuery({
          queryKey: [...prefix, offset],
          queryFn: () => fetchStudents({ offset, limit: PAGE_SIZE, name: nameArg }),
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

  // ── 监听 searchTerm 变化，重置缓存并重新加载 ──

  if (searchTerm) {
    watch(
      searchTerm,
      (newVal) => {
        const trimmed = newVal?.trim() ?? '';
        if (trimmed === currentSearch.value) return;

        isResetting.value = true;

        // 清空旧搜索的所有缓存
        const oldPrefix = currentSearch.value
          ? ['students', currentSearch.value, 'offset']
          : ['students', '', 'offset'];
        queryClient.removeQueries({ queryKey: oldPrefix, exact: false });

        currentSearch.value = trimmed;
        total.value = 0;
        version.value++;

        // 重置完成后重新加载第一页
        isResetting.value = false;
      },
      { immediate: true },
    );
  }

  // ── 加载第一页获取 total ──

  const prefix = computed(() => queryKeyPrefix());

  const firstPageQuery = useQuery({
    queryKey: computed(() => [...prefix.value, 0]),
    queryFn: () => {
      const nameArg = currentSearch.value || undefined;
      return fetchStudents({ offset: 0, limit: PAGE_SIZE, name: nameArg });
    },
    staleTime: 30_000,
  });

  watchEffect(() => {
    if (firstPageQuery.data.value) {
      total.value = firstPageQuery.data.value.total;
      version.value++; // 第一页数据就绪后触发重渲染
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
