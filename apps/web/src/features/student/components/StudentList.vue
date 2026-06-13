<template>
  <div v-if="isLoading" class="flex-1 overflow-x-hidden overflow-y-auto">
    <!-- Sticky header — matches data table layout -->
    <div
      class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
      style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1.2fr 1fr"
    >
      <div
        v-for="column in columns"
        :key="column"
        class="truncate px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
      >
        {{ column }}
      </div>
    </div>

    <!-- Skeleton rows -->
    <div class="divide-y divide-gray-200 dark:divide-[#343434]">
      <StudentListItemSkeleton v-for="index in 8" :key="index" />
    </div>
  </div>
  <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
    {{ error }}
  </div>
  <div
    v-else-if="total === 0"
    class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
  >
    No students found.
  </div>
  <div v-else ref="scrollElement" class="flex-1 overflow-x-hidden overflow-y-auto">
    <!-- Sticky header — CSS Grid keeps columns aligned with virtual rows -->
    <div
      class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
      style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1.2fr 1fr"
    >
      <div
        v-for="column in columns"
        :key="column"
        class="truncate px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
      >
        {{ column }}
      </div>
    </div>

    <!-- Virtual body — fixed total height for stable scrollbar -->
    <div
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="String(virtualRow.key)"
        class="border-b border-gray-200 transition hover:bg-gray-50 dark:border-[#343434] dark:hover:bg-[#202020]"
        :style="{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
        :data-index="virtualRow.index"
      >
        <StudentListItem v-if="isLoaded(virtualRow.index)" :student="getItem(virtualRow.index)!" />
        <StudentListItemSkeleton v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useStudentSparseQuery } from '@/features/student/hooks/useStudentSparseQuery';
import StudentListItem from '@/features/student/components/StudentListItem.vue';
import StudentListItemSkeleton from '@/features/student/components/StudentListItemSkeleton.vue';

const props = defineProps<{
  searchTerm?: string;
}>();

const columns = ['Name', 'Email', 'Phone', 'Created At', 'Actions'];

const searchRef = computed(() => props.searchTerm ?? '');

const { getItem, isLoaded, total, isLoading, error, ensureRange } =
  useStudentSparseQuery(searchRef);

const scrollElement = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: total.value,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => 70,
    overscan: 10,
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
