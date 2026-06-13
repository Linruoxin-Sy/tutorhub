<template>
  <VirtualList
    :get-item="getItem"
    :is-loaded="isLoaded"
    :total="total"
    :is-loading="isLoading"
    :error="error"
    :ensure-range="ensureRange"
    :estimate-size="164"
    :overscan="5"
    scroll-class="flex-1 overflow-x-hidden overflow-y-auto p-5"
  >
    <template #loading>
      <div class="flex flex-col gap-5">
        <CourseListItemSkeleton v-for="index in 4" :key="index" />
      </div>
    </template>

    <template #item="{ item, isLoaded }">
      <CourseListItem v-if="isLoaded" :course="item as Course" />
      <CourseListItemSkeleton v-else />
    </template>

    <template #empty>
      <div
        class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
      >
        <div
          class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
        >
          No courses found.
        </div>
      </div>
    </template>
  </VirtualList>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Course } from '@tutorhub/database';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchCourses } from '@/features/course/api/course-api';
import CourseListItem from '@/features/course/components/CourseListItem.vue';
import CourseListItemSkeleton from '@/features/course/components/CourseListItemSkeleton.vue';
import VirtualList from '@/components/VirtualList.vue';

const props = defineProps<{
  searchTerm?: string;
  statusTerm?: string;
}>();

const searchRef = computed(() => props.searchTerm ?? '');
const statusRef = computed(() => props.statusTerm ?? '');

const { getItem, isLoaded, total, isLoading, error, ensureRange } = useSparseQuery<Course>({
  queryKeyPrefix: ['courses'],
  fetchFn: (params) => fetchCourses(params as Parameters<typeof fetchCourses>[0]),
  filters: { name: searchRef, status: statusRef },
});
</script>
