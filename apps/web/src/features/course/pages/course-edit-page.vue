<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Edit Course" description="Update the course information below." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading course data..." />
      </CardSection>

      <!-- Form -->
      <CardSection v-else class="p-6">
        <CourseForm v-model="formData">
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
        </CourseForm>
      </CardSection>

      <!-- Enrolled students -->
      <ListPageShell title="Enrolled Students">
        <template #filters>
          <SearchInput v-model="search" placeholder="Search students..." />
        </template>
        <template #actions>
          <AddButton @click="() => {}">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Student</span>
          </AddButton>
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
                <StudentItemSkeleton v-for="index in 8" :key="index" />
              </div>
            </template>

            <template #item="{ item, isLoaded }">
              <StudentItem
                v-if="isLoaded"
                :student="item!.student"
                :actions="['edit', 'delete']"
                @delete="handleDeleteStudent(item!)"
              />
              <StudentItemSkeleton v-else />
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
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useRoute } from 'vue-router';
import { useCourseEditForm } from '@/features/course/hooks/useCourseEditForm';
import CourseForm from '@/features/course/components/CourseForm.vue';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchCourseEnrollments, deleteEnrollment } from '@/features/enrollment/api/enrollment-api';
import StudentItem from '@/features/student/components/StudentItem.vue';
import StudentItemSkeleton from '@/features/student/components/StudentItemSkeleton.vue';
import { useDialog } from '@/hooks/useDialog';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import AddButton from '@/components/AddButton.vue';
import SearchInput from '@/components/SearchInput.vue';
import type { CourseEnrollmentListResponse } from '@tutorhub/schema';

type EnrollmentItem = CourseEnrollmentListResponse['items'][number];

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const { formData, hasChanged, isInitialLoading, submit, isSubmitting } = useCourseEditForm(id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);

const columns = ['Name', 'Email', 'Phone', 'Created At', 'Actions'];

const searchRef = computed(() => debouncedSearch.value ?? '');

const sparseQuery = useSparseQuery<EnrollmentItem>({
  queryKeyPrefix: ['course-enrollments', id],
  fetchFn: (params) => fetchCourseEnrollments(id, params),
  filters: { name: searchRef },
});

const queryClient = useQueryClient();
const { confirm } = useDialog();

async function handleDeleteStudent(item: EnrollmentItem) {
  const confirmed = await confirm({
    title: 'Delete Enrollment',
    message: `Are you sure you want to remove "${item.student.name}" from this course?`,
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteEnrollment(item.id);
    toast.success('Student removed from course successfully!');
    queryClient.invalidateQueries({ queryKey: ['course-enrollments', id] });
  } catch {
    toast.error('Failed to remove student from course');
  }
}
</script>
