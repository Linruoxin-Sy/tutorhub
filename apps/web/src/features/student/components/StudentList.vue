<template>
  <VirtualList
    :query="sparseQuery"
    :estimate-size="70"
    :overscan="10"
    row-class="border-b border-gray-200 transition hover:bg-gray-50 dark:border-[#343434] dark:hover:bg-[#202020]"
    :row-style="{ display: 'flex' }"
  >
    <template #header>
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
    </template>

    <template #loading>
      <div class="divide-y divide-gray-200 dark:divide-[#343434]">
        <StudentListItemSkeleton v-for="index in 8" :key="index" />
      </div>
    </template>

    <template #item="{ item, isLoaded }">
      <StudentListItem v-if="isLoaded" :student="item!" />
      <StudentListItemSkeleton v-else />
    </template>

    <template #empty>
      <div
        class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
      >
        No students found.
      </div>
    </template>
  </VirtualList>
</template>

<script setup lang="ts">
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchStudents, type StudentListResponse } from '@/features/student/api/student-api';
import StudentListItem from '@/features/student/components/StudentListItem.vue';
import StudentListItemSkeleton from '@/features/student/components/StudentListItemSkeleton.vue';
import VirtualList from '@/components/VirtualList.vue';

type StudentItem = StudentListResponse['items'][number];

const props = defineProps<{
  searchTerm?: string;
}>();

const columns = ['Name', 'Email', 'Phone', 'Created At', 'Actions'];

const searchRef = computed(() => props.searchTerm ?? '');

const sparseQuery = useSparseQuery<StudentItem>({
  queryKeyPrefix: ['students'],
  fetchFn: (params) => fetchStudents(params as Parameters<typeof fetchStudents>[0]),
  filters: { name: searchRef },
});
</script>
