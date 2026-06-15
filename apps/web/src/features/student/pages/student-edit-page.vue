<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Edit Student" description="Update the student's information below." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading student data..." />
      </CardSection>

      <!-- Form -->
      <CardSection v-else class="p-6">
        <StudentForm
          v-model="formData"
          :avatar-url="currentAvatarUrl"
          @avatar-change="handlePendingFile"
        >
          <template #actions>
            <button
              :disabled="isSubmitting || !hasChanged"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="submit"
            >
              <span v-if="isSubmitting">Saving...</span>
              <span v-else-if="!hasChanged">No changes</span>
              <span v-else>Save Changes</span>
            </button>
          </template>
        </StudentForm>
      </CardSection>

      <!-- Enrolled courses -->
      <ListPageShell title="Enrolled Courses">
        <template #filters>
          <SearchInput v-model="search" placeholder="Search courses..." />
        </template>
        <template #actions>
          <AddButton @click="() => {}">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Course</span>
          </AddButton>
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
                <CourseListItemSkeleton v-for="index in 4" :key="index" />
              </div>
            </template>

            <template #item="{ item, isLoaded }">
              <CourseListItem v-if="isLoaded" :course="item!" :actions="['edit', 'delete']" />
              <CourseListItemSkeleton v-else />
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
import { useStudentEditForm } from '@/features/student/hooks/useStudentEditForm';
import StudentForm from '@/features/student/components/StudentForm.vue';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchCourses } from '@/features/course/api/course-api';
import CourseListItem from '@/features/course/components/CourseListItem.vue';
import CourseListItemSkeleton from '@/features/course/components/CourseListItemSkeleton.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import AddButton from '@/components/AddButton.vue';
import SearchInput from '@/components/SearchInput.vue';
import type { Course } from '@tutorhub/database';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const {
  formData,
  currentAvatarUrl,
  hasChanged,
  isInitialLoading,
  submit,
  isSubmitting,
  handlePendingFile,
} = useStudentEditForm(id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => '');
const studentIdRef = computed(() => id);

const sparseQuery = useSparseQuery<Course>({
  queryKeyPrefix: ['courses'],
  fetchFn: (params) => fetchCourses(params as Parameters<typeof fetchCourses>[0]),
  filters: { name: searchRef, status: statusRef, studentId: studentIdRef },
});
</script>
