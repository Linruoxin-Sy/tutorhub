<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title-key="course.edit.title" description-key="course.edit.description" />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator :text="t('common.loading.course')" />
      </CardSection>

      <!-- Form -->
      <CardSection v-else class="p-6">
        <CourseForm v-model="formData">
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
        </CourseForm>
      </CardSection>

      <!-- Enrolled students -->
      <ListPageShell title-key="course.enrolledStudents.title">
        <template #filters>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
            <SearchInput
              v-model="search"
              :placeholder="t('course.enrolledStudents.searchPlaceholder')"
            />

            <SelectInput v-model="status">
              <option value=""><T keypath="common.status.all" /></option>
              <option value="ACTIVE"><T keypath="common.status.active" /></option>
              <option value="DISABLED"><T keypath="common.status.disabled" /></option>
            </SelectInput>
          </div>
        </template>
        <template #actions>
          <AppButton @click="router.push({ name: 'course.add-student', params: { id } })">
            <i class="i-lucide-plus size-4"></i>
            <span><T keypath="common.actions.addStudent" /></span>
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
                style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1fr 1.2fr 1fr"
              >
                <div
                  v-for="column in columns"
                  :key="column"
                  class="truncate px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
                >
                  <T>{{ column }}</T>
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
                <T keypath="course.enrolledStudents.empty" />
              </div>
            </template>
          </VirtualList>
        </div>
      </ListPageShell>

      <!-- Class Rules -->
      <ListPageShell title-key="course.classRules.title">
        <template #actions>
          <AppButton @click="router.push('/class-rule/create?courseId=' + id)">
            <i class="i-lucide-plus size-4"></i>
            <span><T keypath="common.actions.addRule" /></span>
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
                  <T keypath="common.empty.noClassRulesWithHint" />
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
import { useCourseEditForm } from '@/features/course/hooks/useCourseEditForm';
import { i18n } from '@/locales';
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
import SelectInput from '@/components/SelectInput.vue';
import type { CourseEnrollmentListResponse, ClassRuleListItem } from '@tutorhub/schema';

type EnrollmentItem = CourseEnrollmentListResponse['items'][number];

const route = useRoute();
const router = useRouter();
const id = (route.params as Record<string, string>).id;

const { t, tm } = useI18n();
const { formData, hasChanged, isInitialLoading, submit, isSubmitting } = useCourseEditForm(id);

const search = ref('');
const debouncedSearch = refDebounced(search, 300);

const status = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');

const columns = computed(() => tm('course.columns'));

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<EnrollmentItem>({
  queryKeyPrefix: ['course-enrollments', id],
  fetchFn: (params) => fetchCourseEnrollments(id, params),
  filters: { name: searchRef, status: statusRef },
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
    title: i18n.global.t('common.enrollmentRemoval.title'),
    message: i18n.global.t('course.removeStudent.message', { student: item.student.name }),
    confirmText: i18n.global.t('common.actions.delete'),
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteEnrollment(item.id);
    toast.success(i18n.global.t('course.removeStudent.success'));
    queryClient.invalidateQueries({ queryKey: ['course-enrollments', id] });
  } catch {
    toast.error(i18n.global.t('course.removeStudent.error'));
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
    title: i18n.global.t('course.deleteRule.title'),
    message: i18n.global.t('course.deleteRule.message'),
    confirmText: i18n.global.t('common.actions.delete'),
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteClassRule(rule.id);
    toast.success(i18n.global.t('course.deleteRule.success'));
    queryClient.invalidateQueries({ queryKey: ['course-class-rules', id] });
  } catch {
    toast.error(i18n.global.t('course.deleteRule.error'));
  }
}
</script>
