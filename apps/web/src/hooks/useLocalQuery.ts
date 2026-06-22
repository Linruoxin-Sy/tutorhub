import { computed, type ComputedRef, type Ref } from 'vue';

/**
 * 将本地数组包装成 VirtualList 兼容的 SparseQueryResult 对象，
 * 用于展示本地生成的列表数据（如 rrule 生成的 sessions）。
 */
export function useLocalQuery<TItem>(items: Ref<TItem[]> | ComputedRef<TItem[]>) {
  const total = computed(() => items.value.length);

  function getItem(index: number): TItem | undefined {
    return items.value[index];
  }

  function isLoaded(_index: number): boolean {
    void _index;
    return true;
  }

  async function ensureRange(_start: number, _end: number): Promise<void> {
    void _start;
    void _end;
    // 本地数据无需预取
  }

  return {
    getItem,
    isLoaded,
    total,
    isLoading: false,
    error: '',
    ensureRange,
  };
}
