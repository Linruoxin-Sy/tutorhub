<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <ListPageShell title="Add Students" description="Select students to enroll in this course.">
      <template #filters>
        <SearchInput v-model="search" placeholder="Search students..." />
      </template>

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
            <StudentItem v-for="index in 8" :key="index" loading :student="undefined as any" />
          </div>
        </template>

        <template #item="{ item, isLoaded }">
          <StudentItem
            :student="item!"
            :loading="!isLoaded"
            :actions="[]"
            :selected="!!item && selectedIds.has(item.id)"
            @view="item && toggleItem(item.id)"
          />
        </template>

        <template #empty>
          <div
            class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
          >
            No available students found.
          </div>
        </template>
      </VirtualList>
    </ListPageShell>

    <!-- 底部提交栏 -->
    <div
      class="flex items-center justify-end gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ selectedIds.size }} student(s) selected
      </span>
      <button
        :disabled="selectedIds.size === 0 || isSubmitting"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="submit"
      >
        <span v-if="isSubmitting">Adding...</span>
        <span v-else>Add to Course</span>
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { useRouter, useRoute } from 'vue-router';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchAvailableStudents, createEnrollment } from '@/features/enrollment/api/enrollment-api';
import StudentItem from '@/features/student/components/StudentItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';
import type { Student } from '@tutorhub/database';

const router = useRouter();
const route = useRoute();
const id = (route.params as Record<string, string>).id;

const columns = ['Name', 'Email', 'Phone', 'Created At', 'Status'];

const search = ref('');
const debouncedSearch = refDebounced(search, 300);
const searchRef = computed(() => debouncedSearch.value ?? '');

const sparseQuery = useSparseQuery<Student>({
  queryKeyPrefix: ['available-students', id],
  fetchFn: (params) => fetchAvailableStudents(id, params),
  filters: { name: searchRef },
});

/** 使用 Set 存储已选项的 ID，O(1) 查找 */
const selectedIds = ref(new Set<string>());

function toggleItem(itemId: string) {
  const next = new Set(selectedIds.value);
  if (next.has(itemId)) {
    next.delete(itemId);
  } else {
    next.add(itemId);
  }
  selectedIds.value = next;
}

const isSubmitting = ref(false);

async function submit() {
  if (selectedIds.value.size === 0) return;
  isSubmitting.value = true;

  try {
    const selectedArray = Array.from(selectedIds.value);
    await Promise.all(selectedArray.map((studentId) => createEnrollment(studentId, id)));
    toast.success(`Successfully added ${selectedArray.length} student(s)!`);
    router.push({ name: 'course.edit', params: { id } });
  } catch {
    toast.error('Failed to add students');
  } finally {
    isSubmitting.value = false;
  }
}
</script>
