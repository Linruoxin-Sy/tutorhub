<template>
  <div v-if="isLoading" class="flex-1 overflow-auto p-5">
    <div class="flex flex-col gap-5">
      <CourseListItemSkeleton v-for="index in 4" :key="index" />
    </div>
  </div>

  <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
    {{ error }}
  </div>

  <div
    v-else-if="total === 0"
    class="flex-1 flex items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
  >
    <div
      class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
    >
      No courses found.
    </div>
  </div>

  <div v-else ref="scrollElement" class="flex-1 overflow-auto p-5">
    <div
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="String(virtualRow.key)"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
        :data-index="virtualRow.index"
      >
        <CourseListItem v-if="isLoaded(virtualRow.index)" :course="getItem(virtualRow.index)!" />
        <CourseListItemSkeleton v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useCourseSparseQuery } from '@/features/course/hooks/useCourseSparseQuery';
import CourseListItem from '@/features/course/components/CourseListItem.vue';
import CourseListItemSkeleton from '@/features/course/components/CourseListItemSkeleton.vue';

const { getItem, isLoaded, total, isLoading, error, ensureRange } = useCourseSparseQuery();

const scrollElement = ref<HTMLElement | null>(null);

/** 卡片高度固定为 h-36 = 144px，gap-5 = 20px，合计每个虚拟行 164px */
const ROW_HEIGHT = 164;

const virtualizer = useVirtualizer(
  computed(() => ({
    count: total.value,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
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
    await ensureRange(range.first - pad, range.last + pad);
  },
  { deep: true },
);
</script>
