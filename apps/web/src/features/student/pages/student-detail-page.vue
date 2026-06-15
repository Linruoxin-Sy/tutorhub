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
              <CourseItem v-if="isLoaded" :course="item!" :actions="[]" />
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
        </div>
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useRoute } from 'vue-router';
import StudentForm from '@/features/student/components/StudentForm.vue';
import { useStudentDetailForm } from '@/features/student/hooks/useStudentDetailForm';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchStudentEnrollments } from '@/features/enrollment/api/enrollment-api';
import CourseItem from '@/features/course/components/CourseItem.vue';
import CourseItemSkeleton from '@/features/course/components/CourseItemSkeleton.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';
import type { Course } from '@tutorhub/database';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const { data: student, isInitialLoading, avatarUrl } = useStudentDetailForm(id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');

const sparseQuery = useSparseQuery<Course>({
  queryKeyPrefix: ['student-enrollments', id],
  fetchFn: async (params) => {
    const res = await fetchStudentEnrollments(id, params);
    return { items: res.items.map((e) => e.course), total: res.total };
  },
  filters: { name: searchRef },
});
</script>
