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
          <button
            type="button"
            class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            @click="router.push({ name: 'course.create' })"
          >
            <i class="i-lucide-plus size-4"></i>
            Add Course
          </button>
        </template>

        <CourseList :search-term="debouncedSearch" :status-term="status" />
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CourseList from '@/features/course/components/CourseList.vue';

const router = useRouter();

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('');
const debouncedSearch = refDebounced(search, 300);
</script>
