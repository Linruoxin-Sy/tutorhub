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

        <CourseList
          :search-term="debouncedSearch"
          :status-term="status"
          @view="(item) => router.push({ name: 'course.detail', params: { id: item.id } })"
          @edit="(item) => router.push({ name: 'course.edit', params: { id: item.id } })"
          @delete="handleDelete"
        />
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseDelete } from '@/features/course/hooks/useCourseDelete';
import CourseList from '@/features/course/components/CourseList.vue';
import type { Course } from '@tutorhub/database';

const router = useRouter();
const { confirmAndDelete } = useCourseDelete();

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('');
const debouncedSearch = refDebounced(search, 300);

async function handleDelete(item: Course) {
  try {
    await confirmAndDelete({ id: item.id, name: item.name });
  } catch {
    // User cancelled or delete failed
  }
}
</script>
