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
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
            <SearchInput v-model="search" placeholder="Search courses..." />

            <SelectInput v-model="status">
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </SelectInput>
          </div>
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
                <CourseItem v-for="index in 4" :key="index" loading />
              </div>
            </template>

            <template #item="{ item, isLoaded }">
              <CourseItem
                :course="item!.course"
                :loading="!isLoaded"
                :actions="[]"
                @view="router.push({ name: 'enrollment.detail', params: { id: item!.id } })"
              />
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
import { useRoute, useRouter } from 'vue-router';
import StudentForm from '@/features/student/components/StudentForm.vue';
import { useStudentDetailForm } from '@/features/student/hooks/useStudentDetailForm';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchStudentEnrollments } from '@/features/enrollment/api/enrollment-api';
import CourseItem from '@/features/course/components/CourseItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import type { StudentEnrollmentListResponse } from '@tutorhub/schema';

type EnrollmentItem = StudentEnrollmentListResponse['items'][number];

const route = useRoute();
const router = useRouter();
const id = (route.params as Record<string, string>).id;

const { data: student, isInitialLoading, avatarUrl } = useStudentDetailForm(id);

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<EnrollmentItem>({
  queryKeyPrefix: ['student-enrollments', id],
  fetchFn: (params) => fetchStudentEnrollments(id, params),
  filters: { name: searchRef, status: statusRef },
});
</script>
