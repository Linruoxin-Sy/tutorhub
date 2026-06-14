<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Course Details" description="View the full information of the course." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading course data..." />
      </CardSection>

      <!-- Detail content -->
      <CardSection v-else class="p-6">
        <CourseForm v-model="data" readonly />
      </CardSection>

      <!-- Enrolled students -->
      <ListPageShell title="Enrolled Students">
        <template #filters>
          <SearchInput v-model="search" placeholder="Search students..." />
        </template>

        <div class="flex h-125 flex-col">
          <StudentList
            :course-id="id"
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
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import CourseForm from '@/features/course/components/CourseForm.vue';
import StudentList from '@/features/student/components/StudentList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';

const props = defineProps<{
  id: string;
}>();

const { data, isInitialLoading } = useCourseDetail(props.id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);
</script>
