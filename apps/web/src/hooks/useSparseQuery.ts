import { useQuery, useQueryClient } from '@tanstack/vue-query';
import pLimit from 'p-limit';
import { computed, readonly, ref, watch, watchEffect, type Ref } from 'vue';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_STALE_TIME = 30_000;

/**
 * 基于 offset 分页 + TanStack Query 缓存的泛化稀疏数据查询。
 *
 * 支持任意筛选条件：传入 `filters` 映射，key 为参数名，value 为 Ref<string>，
 * 空字符串表示"无此筛选"，不参与 query key 和 API 参数。
 * 筛选条件变化时自动清空旧缓存并重新加载第一页。
 */
export function useSparseQuery<TItem>(config: {
  /** 查询 key 前缀，用于 TanStack Query 缓存隔离 */
  queryKeyPrefix: string[];
  /** 返回 `{ items, total }` 的 API 调用函数 */
  fetchFn: (params: Record<string, unknown>) => Promise<{
    items: TItem[];
    total: number;
  }>;
  /** 筛选条件映射 — key = API 参数名，value = Ref<string>，空串视为无此筛选 */
  filters?: Record<string, Ref<string>>;
  /** 每页条数，默认 20 */
  pageSize?: number;
  /** 并发预取数，默认 4 */
  concurrency?: number;
  /** 缓存过期时间（ms），默认 30_000 */
  staleTime?: number;
}) {
  const {
    queryKeyPrefix: basePrefix,
    fetchFn,
    filters = {},
    pageSize = DEFAULT_PAGE_SIZE,
    concurrency = DEFAULT_CONCURRENCY,
    staleTime = DEFAULT_STALE_TIME,
  } = config;

  const queryClient = useQueryClient();
  const total = ref(0);
  /** 版本戳 — 每次预取完成后递增，驱动模板响应式重渲染 */
  const version = ref(0);
  /** 当前筛选条件快照，用于构建 query key 和 API 参数 */
  const currentFilters = ref<Record<string, string>>({});

  // ── 构建 query key 前缀（含筛选条件） ──

  function buildPrefix(): (string | number)[] {
    const parts = [...basePrefix];
    // 排序保证 key 顺序稳定
    for (const [key, value] of Object.entries(currentFilters.value).sort()) {
      if (value) parts.push(`${key}:${value}`);
    }
    parts.push('offset');
    return parts;
  }

  // ── 构建 API 参数 ──

  function buildParams(offset: number): Record<string, unknown> {
    const params: Record<string, unknown> = { offset, limit: pageSize };
    for (const [key, value] of Object.entries(currentFilters.value)) {
      if (value) params[key] = value;
    }
    return params;
  }

  // ── 从缓存中读取指定索引的数据 ──

  function getItem(index: number): TItem | undefined {
    void version.value; // 建立响应式依赖
    const prefix = buildPrefix();
    const offset = Math.floor(index / pageSize) * pageSize;
    const data = queryClient.getQueryData<{ items: TItem[]; total: number }>([...prefix, offset]);
    return data?.items[index - offset];
  }

  function isLoaded(index: number): boolean {
    void version.value; // 建立响应式依赖
    const prefix = buildPrefix();
    const offset = Math.floor(index / pageSize) * pageSize;
    return !!queryClient.getQueryData([...prefix, offset]);
  }

  // ── 预取指定范围内的页面 ──

  async function ensureRange(startIdx: number, endIdx: number): Promise<void> {
    const prefix = buildPrefix();
    const s = Math.max(0, Math.floor(startIdx / pageSize) * pageSize);
    const e = Math.min(total.value || Infinity, Math.ceil((endIdx + 1) / pageSize) * pageSize);

    const missing: number[] = [];
    for (let offset = s; offset < e; offset += pageSize) {
      if (!queryClient.getQueryData([...prefix, offset])) {
        missing.push(offset);
      }
    }

    if (missing.length === 0) return;

    // 使用 p-limit 控制并发数
    const limit = pLimit(concurrency);
    const promises = missing.map((offset) =>
      limit(() =>
        queryClient.prefetchQuery({
          queryKey: [...prefix, offset],
          queryFn: () => fetchFn(buildParams(offset)),
          staleTime,
        }),
      ),
    );

    // 每批加载完成后递增版本戳，触发模板重新渲染
    for (let i = 0; i < promises.length; i += concurrency) {
      await Promise.all(promises.slice(i, i + concurrency));
      version.value++;
    }
  }

  // ── 监听筛选条件变化，重置缓存并重新加载 ──

  const filterKeys = Object.keys(filters);

  if (filterKeys.length > 0) {
    watch(
      filterKeys.map((k) => filters[k]),
      () => {
        const newSnapshot: Record<string, string> = {};
        for (const key of filterKeys) {
          const val = filters[key].value;
          if (val) newSnapshot[key] = val;
        }

        // 浅比较，无变化则跳过
        const old = currentFilters.value;
        if (
          Object.keys(newSnapshot).length === Object.keys(old).length &&
          Object.entries(newSnapshot).every(([k, v]) => old[k] === v)
        ) {
          return;
        }

        // 清空旧缓存
        const oldPrefix = buildPrefix();
        queryClient.removeQueries({ queryKey: oldPrefix, exact: false });

        currentFilters.value = newSnapshot;
        total.value = 0;
        version.value++;
      },
      { immediate: true },
    );
  }

  // ── 加载第一页获取 total ──

  const prefix = computed(() => buildPrefix());

  const firstPageQuery = useQuery({
    queryKey: computed(() => [...prefix.value, 0]),
    queryFn: () => fetchFn(buildParams(0)),
    staleTime,
  });

  watchEffect(() => {
    if (firstPageQuery.data.value) {
      total.value = firstPageQuery.data.value.total;
      version.value++; // 第一页数据就绪后触发重渲染
    }
  });

  const displayError = computed(() => {
    if (firstPageQuery.error.value) {
      return firstPageQuery.error.value instanceof Error
        ? firstPageQuery.error.value.message
        : 'Failed to load data';
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
