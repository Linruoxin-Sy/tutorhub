<template>
  <main class="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="flex h-full flex-col gap-6">
      <ListPageShell title="Courses">
        <template #filters>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
            <SearchInput v-model="search" placeholder="Search courses..." />

            <SelectInput v-model="status">
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </SelectInput>
          </div>
        </template>
        <template #actions>
          <AddButton @click="router.push({ name: 'course.create' })">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Course</span>
          </AddButton>
        </template>

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
              :actions="['edit', 'delete']"
              @view="router.push({ name: 'course.detail', params: { id: item!.id } })"
              @edit="router.push({ name: 'course.edit', params: { id: item!.id } })"
              @delete="handleDelete(item!)"
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
                No courses found.
              </div>
            </div>
          </template>
        </VirtualList>
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useCourseDelete } from '@/features/course/hooks/useCourseDelete';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchCourses } from '@/features/course/api/course-api';
import CourseItem from '@/features/course/components/CourseItem.vue';
import CourseItemSkeleton from '@/features/course/components/CourseItemSkeleton.vue';
import VirtualList from '@/components/VirtualList.vue';
import type { Course } from '@tutorhub/database';

const router = useRouter();
const { confirmAndDelete } = useCourseDelete();

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<Course>({
  queryKeyPrefix: ['courses'],
  fetchFn: (params) => fetchCourses(params as Parameters<typeof fetchCourses>[0]),
  filters: { name: searchRef, status: statusRef },
});

async function handleDelete(item: Course) {
  try {
    await confirmAndDelete({ id: item.id, name: item.name });
  } catch {
    // User cancelled or delete failed
  }
}
</script>
