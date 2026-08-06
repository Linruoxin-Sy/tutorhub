<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title-key="classRule.edit.title" description-key="classRule.edit.description" />

    <!-- Loading -->
    <CardSection v-if="isInitialLoading" class="shrink-0 p-6">
      <LoadingIndicator :text="t('common.loading.classRule')" />
    </CardSection>

    <!-- Form card -->
    <CardSection v-else class="shrink-0 space-y-5 p-6">
      <ClassRuleForm v-model="formData">
        <template #actions>
          <Transition
            mode="out-in"
            enter-active-class="transition duration-250"
            leave-active-class="transition duration-150"
            enter-from-class="opacity-0 scale-[0.92]"
            leave-to-class="opacity-0 scale-[0.92]"
          >
            <button
              v-if="onlyNameOrPriceChanged"
              key="save-changes"
              :disabled="!canSubmit"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="doUpdate"
            >
              <span v-if="isSubmitting">
                <T keypath="common.actions.saving" />
              </span>
              <span v-else>
                <T keypath="common.actions.saveChanges" />
              </span>
            </button>
            <button
              v-else-if="!conflictPassed && hasChanges"
              key="conflict-check"
              :disabled="!canSubmit"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="handleConflictCheck"
            >
              <span v-if="isSubmitting">
                <T keypath="common.actions.checking" />
              </span>
              <span v-else>
                <T keypath="common.actions.conflictCheck" />
              </span>
            </button>
            <button
              v-else-if="conflictPassed"
              key="update"
              :disabled="!canSubmit"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="handleUpdate"
            >
              <span v-if="isSubmitting">
                <T keypath="common.actions.saving" />
              </span>
              <span v-else>
                <T keypath="common.actions.updateClassRule" />
              </span>
            </button>
            <button
              v-else
              key="no-changes"
              disabled
              class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
            >
              <T keypath="common.actions.noChanges" />
            </button>
          </Transition>
        </template>
      </ClassRuleForm>
    </CardSection>

    <!-- Generated sessions -->
    <ListPageShell
      v-if="conflictPassed && generatedSessions.length > 0"
      title-key="classRule.generatedSessions.title"
    >
      <template #actions>
        <span v-if="!isInfinite" class="text-sm text-gray-500 dark:text-gray-400">
          <T
            keypath="classRule.generatedSessions.count"
            :params="{ count: generatedSessions.length }"
          />
        </span>
      </template>

      <div class="flex flex-col">
        <VirtualList
          :query="sessionQuery"
          :estimate-size="90"
          :overscan="10"
          scroll-class="h-125 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #item="{ item }">
            <SessionItem
              v-if="item"
              :course-name="t('common.misc.courseName')"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
              :status="item.status"
              :price="item.price"
            />
          </template>
        </VirtualList>
      </div>
    </ListPageShell>

    <!-- Conflicts -->
    <ListPageShell
      v-if="conflictResult && conflictResult.hasConflict"
      title-key="classRule.conflicts.title"
    >
      <div class="flex flex-col">
        <div class="flex h-125 flex-col gap-3 overflow-y-auto p-5">
          <div
            v-for="conflict in conflictResult.conflicts"
            :key="conflict.date + conflict.startTime"
          >
            <SessionItem
              :course-name="conflict.courseName"
              :date="conflict.date"
              :start-time="conflict.startTime"
              :end-time="conflict.endTime"
              :conflict="true"
            />
            <div
              v-if="conflict.studentNames?.length"
              class="mt-1 px-5 text-xs text-gray-500 dark:text-gray-400"
            >
              <T keypath="common.misc.studentsPrefix" /> {{ conflict.studentNames.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </ListPageShell>

    <!-- Assigned Students -->
    <ListPageShell title-key="classRule.assignedStudents.title">
      <template #filters>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
          <SearchInput
            v-model="studentSearch"
            :placeholder="t('classRule.assignedStudents.searchPlaceholder')"
          />

          <SelectInput v-model="studentStatus">
            <option value=""><T keypath="common.status.all" /></option>
            <option value="ACTIVE"><T keypath="common.status.active" /></option>
            <option value="DISABLED"><T keypath="common.status.disabled" /></option>
          </SelectInput>
        </div>
      </template>
      <template #actions>
        <AppButton
          @click="
            router.push({ name: 'class-rule.add-student', params: { ruleId }, query: { courseId } })
          "
        >
          <i class="i-lucide-plus size-4"></i>
          <span><T keypath="common.actions.addStudent" /></span>
        </AppButton>
      </template>

      <div class="flex h-125 flex-col">
        <VirtualList
          :query="studentQuery"
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
                v-for="column in studentColumns"
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
              @view="router.push({ name: 'student.detail', params: { id: item!.student.id } })"
              @delete="handleRemoveStudent(item!)"
            />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              <T keypath="classRule.assignedStudents.empty" />
            </div>
          </template>
        </VirtualList>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import SessionItem from '@/features/session/components/SessionItem.vue';
import { i18n } from '@/locales';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import AppButton from '@/components/AppButton.vue';
import StudentItem from '@/features/student/components/StudentItem.vue';
import ClassRuleForm from '@/features/class-rule/components/ClassRuleForm.vue';
import { useClassRuleEditForm } from '@/features/class-rule/hooks/useClassRuleEditForm';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { useDialog } from '@/hooks/useDialog';
import {
  fetchClassRuleStudents,
  removeClassRuleStudent,
} from '@/features/class-rule/api/class-rule-api';
import type { ClassRuleStudentListResponse } from '@tutorhub/schema';

type ClassRuleStudentItem = ClassRuleStudentListResponse['items'][number];

const props = defineProps<{
  courseId: string;
  ruleId: string;
}>();

const { t, tm } = useI18n();

const {
  formData,
  hasChanges,
  hasTimeChanged,
  onlyNameOrPriceChanged,
  isInitialLoading,
  conflictResult,
  conflictPassed,
  generatedSessions,
  sessionQuery,
  canSubmit,
  isInfinite,
  isSubmitting,
  runConflictCheck,
  doUpdate,
} = useClassRuleEditForm(props.courseId, props.ruleId);

async function handleConflictCheck() {
  await runConflictCheck();
}

async function handleUpdate() {
  if (hasTimeChanged.value) {
    const confirmed = await confirm({
      title: i18n.global.t('classRule.clearOverrides.title'),
      message: i18n.global.t('classRule.clearOverrides.message'),
      confirmText: i18n.global.t('common.actions.continue'),
      variant: 'primary',
    });

    if (!confirmed) return;
  }

  await doUpdate();
}

// ---- Assigned Students ----

const router = useRouter();
const queryClient = useQueryClient();
const { confirm } = useDialog();

const studentColumns = computed(() => tm('student.columns'));

const studentSearch = ref('');
const debouncedStudentSearch = refDebounced(studentSearch, 300);
const studentSearchRef = computed(() => debouncedStudentSearch.value ?? '');

const studentStatus = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const studentStatusRef = computed(() => studentStatus.value ?? '');

const studentQuery = useSparseQuery<ClassRuleStudentItem>({
  queryKeyPrefix: ['class-rule-students', props.ruleId],
  fetchFn: (params) => fetchClassRuleStudents(props.ruleId, params),
  filters: { name: studentSearchRef, status: studentStatusRef },
});

async function handleRemoveStudent(item: ClassRuleStudentItem) {
  const confirmed = await confirm({
    title: i18n.global.t('classRule.removeStudent.title'),
    message: i18n.global.t('classRule.removeStudent.message', {
      student: item.student.name,
    }),
    confirmText: i18n.global.t('common.actions.remove'),
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await removeClassRuleStudent(item.id);
    toast.success(i18n.global.t('classRule.removeStudent.success'));
    queryClient.invalidateQueries({ queryKey: ['class-rule-students', props.ruleId] });
  } catch {
    toast.error(i18n.global.t('classRule.removeStudent.error'));
  }
}
</script>
