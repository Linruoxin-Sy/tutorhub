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
        <!-- Loaded data row -->
        <template v-if="virtualRow.index < items.length">
          <div class="flex items-center gap-3 whitespace-nowrap px-6 min-w-0">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white shadow-sm"
            >
              {{ items[virtualRow.index].name.charAt(0) }}
            </div>
            <span class="truncate text-sm font-medium text-gray-900 dark:text-white">{{
              items[virtualRow.index].name
            }}</span>
          </div>
          <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
            {{ items[virtualRow.index].email || '-' }}
          </div>
          <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
            {{ items[virtualRow.index].phone || '-' }}
          </div>
          <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
            {{ items[virtualRow.index].grade || '-' }}
          </div>
          <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
            {{ formatDateTime(items[virtualRow.index].createdAt) }}
          </div>
          <div class="flex items-center justify-end gap-1 whitespace-nowrap px-6">
            <button
              type="button"
              class="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
            >
              <i class="i-lucide-square-pen size-4"></i></button
            ><button
              type="button"
              class="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              <i class="i-lucide-trash-2 size-4"></i>
            </button>
          </div>
        </template>

        <!-- Skeleton row -->
        <template v-else>
          <div class="flex items-center gap-3 whitespace-nowrap px-6">
            <div class="size-9 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-[#343434]" />
            <div class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <div class="px-6">
            <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <div class="px-6">
            <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <div class="px-6">
            <div class="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <div class="px-6">
            <div class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <div class="flex items-center justify-end gap-1 px-6">
            <div class="size-8 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
            <div class="size-8 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
          </div>
        </template>
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
import { formatDateTime } from '@/utils/date';
import { useStudentInfiniteQuery } from '@/features/student/hooks/useStudentInfiniteQuery';

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
