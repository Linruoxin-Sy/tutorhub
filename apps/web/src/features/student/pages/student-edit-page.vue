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
            <Transition
              mode="out-in"
              enter-active-class="transition duration-250"
              leave-active-class="transition duration-150"
              enter-from-class="opacity-0 scale-[0.92]"
              leave-to-class="opacity-0 scale-[0.92]"
            >
              <button
                v-if="!hasChanged && !isSubmitting"
                key="no-changes"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
              >
                No changes
              </button>
              <button
                v-else-if="isSubmitting"
                key="saving"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
              >
                Saving...
              </button>
              <button
                v-else
                key="save"
                class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                @click="submit"
              >
                Save Changes
              </button>
            </Transition>
          </template>
        </StudentForm>
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
        <template #actions>
          <AppButton @click="router.push({ name: 'student.add-course', params: { id } })">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Course</span>
          </AppButton>
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
                :actions="['delete']"
                @view="router.push({ name: 'enrollment.detail', params: { id: item!.id } })"
                @delete="handleDeleteCourse(item!)"
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
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useRoute, useRouter } from 'vue-router';
import { useStudentEditForm } from '@/features/student/hooks/useStudentEditForm';
import StudentForm from '@/features/student/components/StudentForm.vue';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import {
  fetchStudentEnrollments,
  deleteEnrollment,
} from '@/features/enrollment/api/enrollment-api';
import CourseItem from '@/features/course/components/CourseItem.vue';
import { useDialog } from '@/hooks/useDialog';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import AppButton from '@/components/AppButton.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import type { StudentEnrollmentListResponse } from '@tutorhub/schema';

type EnrollmentItem = StudentEnrollmentListResponse['items'][number];

const route = useRoute();
const router = useRouter();
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
const status = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<EnrollmentItem>({
  queryKeyPrefix: ['student-enrollments', id],
  fetchFn: (params) => fetchStudentEnrollments(id, params),
  filters: { name: searchRef, status: statusRef },
});

const queryClient = useQueryClient();
const { confirm } = useDialog();

async function handleDeleteCourse(item: EnrollmentItem) {
  const confirmed = await confirm({
    title: 'Delete Enrollment',
    message: `Are you sure you want to remove "${item.course.name}" from this student?`,
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteEnrollment(item.id);
    toast.success('Course removed from student successfully!');
    queryClient.invalidateQueries({ queryKey: ['student-enrollments', id] });
  } catch {
    toast.error('Failed to remove course from student');
  }
}
</script>
