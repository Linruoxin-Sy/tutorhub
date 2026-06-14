<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Student Details" description="View the student's information below." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading student data..." />
      </CardSection>

      <!-- Detail content -->
      <CardSection v-else-if="student" class="p-6">
        <StudentForm v-model="student" :avatar-url="avatarUrl" readonly />
      </CardSection>

      <!-- Enrolled courses -->
      <ListPageShell title="Enrolled Courses">
        <template #filters>
          <SearchInput v-model="search" placeholder="Search courses..." />
        </template>

        <div class="flex h-125 flex-col">
          <CourseList
            :student-id="id"
            :search-term="debouncedSearch"
            :actions="[]"
            @view="() => {}"
            @edit="() => {}"
            @delete="() => {}"
          />
        </div>
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useRoute } from 'vue-router';
import StudentForm from '@/features/student/components/StudentForm.vue';
import { useStudentDetailForm } from '@/features/student/hooks/useStudentDetailForm';
import CourseList from '@/features/course/components/CourseList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const { data: student, isInitialLoading, avatarUrl } = useStudentDetailForm(id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);
</script>
