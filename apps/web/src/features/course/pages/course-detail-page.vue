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
                <StudentItem v-for="index in 8" :key="index" loading />
              </div>
            </template>

            <template #item="{ item, isLoaded }">
              <StudentItem
                :student="item!.student"
                :loading="!isLoaded"
                :actions="[]"
                @view="router.push({ name: 'enrollment.detail', params: { id: item!.id } })"
              />
            </template>

            <template #empty>
              <div
                class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
              >
                No students found.
              </div>
            </template>
          </VirtualList>
        </div>
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import CourseForm from '@/features/course/components/CourseForm.vue';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchCourseEnrollments } from '@/features/enrollment/api/enrollment-api';
import StudentItem from '@/features/student/components/StudentItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';
import type { CourseEnrollmentListResponse } from '@tutorhub/schema';

type EnrollmentItem = CourseEnrollmentListResponse['items'][number];

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const { data, isInitialLoading } = useCourseDetail(props.id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);

const columns = ['Name', 'Email', 'Phone', 'Created At', 'Actions'];

const searchRef = computed(() => debouncedSearch.value ?? '');

const sparseQuery = useSparseQuery<EnrollmentItem>({
  queryKeyPrefix: ['course-enrollments', props.id],
  fetchFn: (params) => fetchCourseEnrollments(props.id, params),
  filters: { name: searchRef },
});
</script>
