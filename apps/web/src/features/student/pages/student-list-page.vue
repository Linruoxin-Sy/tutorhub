<template>
  <main class="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="flex h-full flex-col gap-6">
      <ListPageShell title="Students">
        <template #filters>
          <SearchInput v-model="searchInput" placeholder="Search students..." />
        </template>
        <template #actions>
          <AddButton @click="router.push({ name: 'student.create' })">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Student</span>
          </AddButton>
        </template>

        <StudentList
          :search-term="debouncedSearch"
          @view="(item) => router.push({ name: 'student.detail', params: { id: item.id } })"
          @edit="(item) => router.push({ name: 'student.edit', params: { id: item.id } })"
          @delete="handleDelete"
        />
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useStudentDelete } from '@/features/student/hooks/useStudentDelete';
import StudentList from '@/features/student/components/StudentList.vue';
import type { StudentListResponse } from '@/features/student/api/student-api';

type StudentItem = StudentListResponse['items'][number];

const router = useRouter();
const { confirmAndDelete } = useStudentDelete();

const searchInput = ref('');
const debouncedSearch = refDebounced(searchInput, 300);

async function handleDelete(item: StudentItem) {
  try {
    await confirmAndDelete({ id: item.id, name: item.name });
  } catch {
    // User cancelled or delete failed — nothing to do
  }
}
</script>
