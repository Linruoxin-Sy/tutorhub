<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Add Courses" description="Select courses to enroll the student in." />

    <CardSection class="flex flex-1 flex-col overflow-hidden p-0">
      <!-- 筛选栏 -->
      <div
        class="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-[#343434]"
      >
        <SearchInput v-model="search" placeholder="Search courses..." />
        <SelectInput v-model="status">
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </SelectInput>
      </div>

      <!-- 虚拟列表 -->
      <div class="flex h-0 flex-1">
        <VirtualList
          :query="sparseQuery"
          :estimate-size="164"
          :overscan="5"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto p-5"
        >
          <template #loading>
            <div class="flex flex-col gap-5">
              <CourseItemSkeleton v-for="index in 4" :key="index" />
            </div>
          </template>

          <template #item="{ item, isLoaded }">
            <CourseItem
              v-if="isLoaded"
              :course="item!"
              :actions="[]"
              :selected="selectedIds.has(item!.id)"
              @view="toggleItem(item!.id)"
            />
            <CourseItemSkeleton v-else />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              <div
                class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
              >
                No available courses found.
              </div>
            </div>
          </template>
        </VirtualList>
      </div>
    </CardSection>

    <!-- 底部提交栏 -->
    <div
      class="flex items-center justify-end gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ selectedIds.size }} course(s) selected
      </span>
      <button
        :disabled="selectedIds.size === 0 || isSubmitting"
        class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="submit"
      >
        <span v-if="isSubmitting">Adding...</span>
        <span v-else>Add to Student</span>
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
import { fetchAvailableCourses, createEnrollment } from '@/features/enrollment/api/enrollment-api';
import CourseItem from '@/features/course/components/CourseItem.vue';
import CourseItemSkeleton from '@/features/course/components/CourseItemSkeleton.vue';
import VirtualList from '@/components/VirtualList.vue';
import CardSection from '@/components/CardSection.vue';
import PageHeader from '@/components/PageHeader.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import type { Course } from '@tutorhub/database';

const router = useRouter();
const route = useRoute();
const id = (route.params as Record<string, string>).id;

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<Course>({
  queryKeyPrefix: ['available-courses', id],
  fetchFn: (params) => fetchAvailableCourses(id, params),
  filters: { name: searchRef, status: statusRef },
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
    await Promise.all(selectedArray.map((courseId) => createEnrollment(id, courseId)));
    toast.success(`Successfully added ${selectedArray.length} course(s)!`);
    router.push({ name: 'student.edit', params: { id } });
  } catch {
    toast.error('Failed to add courses');
  } finally {
    isSubmitting.value = false;
  }
}
</script>
