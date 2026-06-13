<template>
  <!-- Loading state -->
  <div v-if="isLoading" :class="scrollClass">
    <slot name="header" />
    <slot name="loading" />
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
    {{ error }}
  </div>

  <!-- Empty state -->
  <div v-else-if="total === 0">
    <slot name="empty" />
  </div>

  <!-- Data state with virtual scrolling -->
  <div v-else ref="scrollElement" :class="scrollClass">
    <slot name="header" />

    <div
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="String(virtualRow.key)"
        :class="rowClass"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
          ...rowStyle,
        }"
        :data-index="virtualRow.index"
      >
        <slot
          name="item"
          :item="getItem(virtualRow.index)"
          :index="virtualRow.index"
          :is-loaded="isLoaded(virtualRow.index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

const props = defineProps<{
  getItem: (index: number) => unknown;
  isLoaded: (index: number) => boolean;
  total: number;
  isLoading: boolean;
  error: string;
  ensureRange: (start: number, end: number) => Promise<void>;
  estimateSize: number;
  overscan?: number;
  scrollClass?: string;
  rowClass?: string;
  rowStyle?: Record<string, string>;
}>();

const overscan = props.overscan ?? 10;
const scrollClass = props.scrollClass ?? 'flex-1 overflow-x-hidden overflow-y-auto';

const rowStyle = computed<Record<string, string>>(() => props.rowStyle ?? {});

const scrollElement = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.total,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => props.estimateSize,
    overscan,
  })),
);

// 可见范围变化 → 自动预取缺失的数据页
watch(
  () => {
    const items = virtualizer.value.getVirtualItems();
    if (items.length === 0) return null;
    return { first: items[0].index, last: items[items.length - 1].index };
  },
  async (range) => {
    if (!range) return;
    // 前后多缓冲 3 页（60 行），减少加载时的骨架闪现
    const pad = 3 * 20;
    await props.ensureRange(range.first - pad, range.last + pad);
  },
  { deep: true },
);
</script>
