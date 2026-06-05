<template>
  <div v-if="isLoading" class="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
    Loading students...
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
  <div v-else ref="scrollElement" class="flex-1 overflow-auto">
    <!-- Sticky header — CSS Grid keeps columns aligned with virtual rows -->
    <div
      class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
      style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1fr 1.2fr 0.8fr"
    >
      <div
        v-for="column in columns"
        :key="column"
        class="truncate whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
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
          display: 'grid',
          gridTemplateColumns: '1.5fr 2fr 1.2fr 1fr 1.2fr 0.8fr',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
        :data-index="virtualRow.index"
      >
        <StudentListItem
          v-if="virtualRow.index < items.length"
          :student="items[virtualRow.index]"
        />
        <StudentListItemSkeleton v-else />
      </div>
    </div>

    <!-- Bottom status indicator -->
    <div class="border-t border-gray-200 px-5 py-3 text-center text-sm dark:border-[#343434]">
      <span
        v-if="isFetchingNextPage"
        class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400"
      >
        <i class="i-lucide-loader-circle size-4 animate-spin"></i>
        Loading more...
      </span>
      <span v-else-if="!hasNextPage" class="text-gray-400 dark:text-gray-500">
        All students loaded · {{ items.length }} total
      </span>
      <span v-else class="text-gray-400 dark:text-gray-500"> Scroll for more </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useStudentInfiniteQuery } from '@/features/student/hooks/useStudentInfiniteQuery';
import StudentListItem from '@/features/student/components/StudentListItem.vue';
import StudentListItemSkeleton from '@/features/student/components/StudentListItemSkeleton.vue';

const columns = ['Name', 'Email', 'Phone', 'Grade', 'Created At', 'Actions'];

const { items, total, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
  useStudentInfiniteQuery();

const scrollElement = ref<HTMLElement | null>(null);
// Virtual
const virtualizer = useVirtualizer(
  computed(() => ({
    count: total.value,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => 70,
    overscan: 5,
  })),
);

// Lazy load — keep fetching pages until visible range has real data
watch(
  () => {
    const virtualItems = virtualizer.value.getVirtualItems();
    return virtualItems.length > 0 ? virtualItems[virtualItems.length - 1].index : 0;
  },
  async (lastVisibleIndex) => {
    while (
      lastVisibleIndex >= items.value.length - 5 &&
      hasNextPage.value &&
      !isFetchingNextPage.value
    ) {
      await fetchNextPage();
      await nextTick();
    }
  },
);
</script>
