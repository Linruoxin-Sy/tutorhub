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

        <StudentList :search-term="debouncedSearch" />
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { useRouter } from 'vue-router';
import StudentList from '@/features/student/components/StudentList.vue';

const router = useRouter();

const searchInput = ref('');
const debouncedSearch = refDebounced(searchInput, 300);
</script>
