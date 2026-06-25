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
            <Transition name="btn-phase" mode="out-in">
              <button
                v-if="!hasChanged && !isSubmitting"
                key="no-changes"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white opacity-70"
              >
                No changes
              </button>
              <button
                v-else-if="isSubmitting"
                key="saving"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white opacity-70"
              >
                Saving...
              </button>
              <button
                v-else
                key="save"
                class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="submit"
              >
                Save Changes
              </button>
            </Transition>
          </template>
        </CourseForm>
      </CardSection>

      <!-- Enrolled students -->
      <ListPageShell title="Enrolled Students">
        <template #filters>
          <SearchInput v-model="search" placeholder="Search students..." />
        </template>
        <template #actions>
          <AppButton @click="router.push({ name: 'course.add-student', params: { id } })">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Student</span>
          </AppButton>
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
                :actions="['delete']"
                @view="router.push({ name: 'enrollment.detail', params: { id: item!.id } })"
                @delete="handleDeleteStudent(item!)"
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

      <!-- Class Rules -->
      <ListPageShell title="Class Rules">
        <template #actions>
          <AppButton @click="router.push('/class-rule/create?courseId=' + id)">
            <i class="i-lucide-plus size-4"></i>
            <span>Add Rule</span>
          </AppButton>
        </template>

        <div class="flex h-125 flex-col">
          <VirtualList
            :query="classRuleQuery"
            :estimate-size="160"
            :overscan="10"
            scroll-class="flex-1 overflow-x-hidden overflow-y-auto p-5"
          >
            <template #loading>
              <div class="divide-y divide-gray-200 dark:divide-[#343434]">
                <ClassRuleItem v-for="index in 3" :key="index" loading />
              </div>
            </template>

            <template #item="{ item, isLoaded }">
              <ClassRuleItem
                :rule="item!"
                :loading="!isLoaded"
                :actions="['edit', 'delete']"
                @view="handleViewRule(item!)"
                @edit="handleEditRule(item!)"
                @delete="handleDeleteRule(item!)"
              />
            </template>

            <template #empty>
              <div
                class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
              >
                <div
                  class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
                >
                  No class rules found. Add a rule to start scheduling.
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
import { useCourseEditForm } from '@/features/course/hooks/useCourseEditForm';
import CourseForm from '@/features/course/components/CourseForm.vue';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchCourseEnrollments, deleteEnrollment } from '@/features/enrollment/api/enrollment-api';
import { fetchClassRules, deleteClassRule } from '@/features/class-rule/api/class-rule-api';
import ClassRuleItem from '@/features/class-rule/components/ClassRuleItem.vue';
import StudentItem from '@/features/student/components/StudentItem.vue';
import { useDialog } from '@/hooks/useDialog';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import AppButton from '@/components/AppButton.vue';
import SearchInput from '@/components/SearchInput.vue';
import type { CourseEnrollmentListResponse, ClassRuleListItem } from '@tutorhub/schema';

type EnrollmentItem = CourseEnrollmentListResponse['items'][number];

const route = useRoute();
const router = useRouter();
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

// Class Rules
const classRuleQuery = useSparseQuery<ClassRuleListItem>({
  queryKeyPrefix: ['course-class-rules', id],
  fetchFn: (params) => fetchClassRules(id, params),
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

function handleViewRule(rule: ClassRuleListItem) {
  router.push('/class-rule/' + rule.id);
}

function handleEditRule(rule: ClassRuleListItem) {
  router.push('/class-rule/' + rule.id + '/edit?courseId=' + id);
}

async function handleDeleteRule(rule: ClassRuleListItem) {
  const confirmed = await confirm({
    title: 'Delete Class Rule',
    message:
      'Are you sure you want to delete this class rule? All future sessions will be removed.',
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteClassRule(rule.id);
    toast.success('Class rule deleted successfully!');
    queryClient.invalidateQueries({ queryKey: ['course-class-rules', id] });
  } catch {
    toast.error('Failed to delete class rule');
  }
}
</script>

<style scoped>
.btn-phase-enter-active {
  transition: all 0.25s ease-out;
}
.btn-phase-leave-active {
  transition: all 0.15s ease-in;
}
.btn-phase-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.btn-phase-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
