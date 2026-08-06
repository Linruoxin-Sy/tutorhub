<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title-key="student.edit.title" description-key="student.edit.description" />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator :text="t('common.loading.student')" />
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
                <T keypath="common.actions.noChanges" />
              </button>
              <button
                v-else-if="isSubmitting"
                key="saving"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
              >
                <T keypath="common.actions.saving" />
              </button>
              <button
                v-else
                key="save"
                class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                @click="submit"
              >
                <T keypath="common.actions.saveChanges" />
              </button>
            </Transition>
          </template>
        </StudentForm>
      </CardSection>

      <!-- Enrolled courses -->
      <ListPageShell title-key="student.enrolledCourses.title">
        <template #filters>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
            <SearchInput
              v-model="search"
              :placeholder="t('student.enrolledCourses.searchPlaceholder')"
            />

            <SelectInput v-model="status">
              <option value=""><T keypath="common.status.all" /></option>
              <option value="ACTIVE"><T keypath="common.status.active" /></option>
              <option value="DISABLED"><T keypath="common.status.disabled" /></option>
            </SelectInput>
          </div>
        </template>
        <template #actions>
          <AppButton @click="router.push({ name: 'student.add-course', params: { id } })">
            <i class="i-lucide-plus size-4"></i>
            <span><T keypath="common.actions.addCourse" /></span>
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
                  <T keypath="student.enrolledCourses.empty" />
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
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStudentEditForm } from '@/features/student/hooks/useStudentEditForm';
import { i18n } from '@/locales';
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

const { t } = useI18n();

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
    title: i18n.global.t('common.enrollmentRemoval.title'),
    message: i18n.global.t('student.removeCourse.message', { course: item.course.name }),
    confirmText: i18n.global.t('common.actions.delete'),
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteEnrollment(item.id);
    toast.success(i18n.global.t('student.removeCourse.success'));
    queryClient.invalidateQueries({ queryKey: ['student-enrollments', id] });
  } catch {
    toast.error(i18n.global.t('student.removeCourse.error'));
  }
}
</script>
