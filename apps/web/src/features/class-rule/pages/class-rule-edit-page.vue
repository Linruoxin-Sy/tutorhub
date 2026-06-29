<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Edit Class Rule"
      description="Modify the class schedule rule for this enrollment."
    />

    <!-- Loading -->
    <CardSection v-if="isInitialLoading" class="shrink-0 p-6">
      <LoadingIndicator text="Loading class rule data..." />
    </CardSection>

    <!-- Form card -->
    <CardSection v-else class="shrink-0 space-y-5 p-6">
      <!-- Date picker -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Start Date <span class="text-red-500">*</span>
        </label>
        <VueDatePicker
          v-model="formData.startDate"
          model-type="yyyy-MM-dd"
          :dark="isDark"
          :ui="datePickerUi"
          :formats="{ input: 'yyyy-MM-dd' }"
          :enable-time-picker="false"
          :clearable="false"
          placeholder="Select start date"
          class="w-full"
        />
      </div>

      <!-- Start time -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Start Time <span class="text-red-500">*</span>
        </label>
        <VueDatePicker
          v-model="formData.startTime"
          model-type="HH:mm"
          :dark="isDark"
          :ui="datePickerUi"
          time-picker
          placeholder="Select start time"
          class="w-full"
        />
      </div>

      <!-- End time -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          End Time <span class="text-red-500">*</span>
        </label>
        <VueDatePicker
          v-model="formData.endTime"
          model-type="HH:mm"
          :dark="isDark"
          :ui="datePickerUi"
          time-picker
          placeholder="Select end time"
          class="w-full"
        />
      </div>

      <!-- Repeat interval -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Repeat Every N Days
          <span class="text-xs font-normal text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <div class="flex items-center gap-3">
          <input
            v-model.number="intervalDaysModel"
            type="number"
            min="1"
            placeholder="Leave empty for single session"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
          <span class="shrink-0 text-sm text-gray-500 dark:text-gray-400">day(s)</span>
        </div>
      </div>

      <!-- End date -->
      <div v-if="formData.intervalDays !== null" class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          End Date
          <span class="text-xs font-normal text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <VueDatePicker
          v-model="formData.endDate"
          model-type="yyyy-MM-dd"
          :dark="isDark"
          :ui="datePickerUi"
          :formats="{ input: 'yyyy-MM-dd' }"
          :enable-time-picker="false"
          :clearable="true"
          placeholder="Leave empty for infinite recurring"
          class="w-full"
        />
        <p v-if="isInfinite" class="text-xs text-amber-600 dark:text-amber-400">
          This rule will repeat indefinitely.
        </p>
      </div>

      <!-- Name -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="e.g. Weekend Class"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      <!-- Price -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Price <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-3">
          <input
            v-model.number="formData.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 200"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
          <span class="shrink-0 text-sm text-gray-500 dark:text-gray-400">¥</span>
        </div>
      </div>

      <!-- Submit button (three-phase state machine) -->
      <Transition
        mode="out-in"
        enter-active-class="transition duration-250"
        leave-active-class="transition duration-150"
        enter-from-class="opacity-0 scale-[0.92]"
        leave-to-class="opacity-0 scale-[0.92]"
      >
        <button
          v-if="!conflictPassed && !hasChanges"
          key="no-changes"
          disabled
          class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
        >
          No changes
        </button>
        <button
          v-else-if="!conflictPassed && hasChanges"
          key="conflict-check"
          :disabled="isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="runConflictCheck"
        >
          <span v-if="isSubmitting">Checking...</span>
          <span v-else>Conflict Check</span>
        </button>
        <button
          v-else
          key="update"
          :disabled="isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="doUpdate"
        >
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>Update Class Rule</span>
        </button>
      </Transition>
    </CardSection>

    <!-- Generated sessions -->
    <ListPageShell v-if="conflictPassed && generatedSessions.length > 0" title="Generated Sessions">
      <template #actions>
        <span v-if="!isInfinite" class="text-sm text-gray-500 dark:text-gray-400">
          {{ generatedSessions.length }} session(s)
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
              course-name="Course"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
              :status="item.status"
            />
          </template>
        </VirtualList>
      </div>
    </ListPageShell>

    <!-- Conflicts -->
    <ListPageShell
      v-if="conflictResult && conflictResult.hasConflict"
      title="Schedule Conflicts Detected"
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
              Students: {{ conflict.studentNames.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </ListPageShell>

    <!-- Assigned Students -->
    <ListPageShell title="Assigned Students">
      <template #filters>
        <SearchInput v-model="studentSearch" placeholder="Search students..." />
      </template>
      <template #actions>
        <AppButton
          @click="
            router.push({ name: 'class-rule.add-student', params: { ruleId }, query: { courseId } })
          "
        >
          <i class="i-lucide-plus size-4"></i>
          <span>Add Student</span>
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
              style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1.2fr 1fr"
            >
              <div
                v-for="column in studentColumns"
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
              @delete="handleRemoveStudent(item!)"
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
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import SearchInput from '@/components/SearchInput.vue';
import AppButton from '@/components/AppButton.vue';
import StudentItem from '@/features/student/components/StudentItem.vue';
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

const {
  formData,
  hasChanges,
  isInitialLoading,
  conflictResult,
  conflictPassed,
  generatedSessions,
  sessionQuery,
  isInfinite,
  isSubmitting,
  runConflictCheck,
  doUpdate,
} = useClassRuleEditForm(props.courseId, props.ruleId);

const { isDark } = useThemeToggle();

// ---- VueDatePicker 双向绑定辅助 ----

const intervalDaysModel = computed({
  get: () => formData.value.intervalDays,
  set: (val: unknown) => {
    const num = typeof val === 'number' ? val : Number(val);
    formData.value.intervalDays = Number.isFinite(num) ? num : null;
    if (formData.value.intervalDays === null) {
      formData.value.endDate = '';
    }
  },
});

// ---- Assigned Students ----

const router = useRouter();
const queryClient = useQueryClient();
const { confirm } = useDialog();

const studentColumns = ['Name', 'Email', 'Phone', 'Created At', 'Actions'];

const studentSearch = ref('');
const debouncedStudentSearch = refDebounced(studentSearch, 300);
const studentSearchRef = computed(() => debouncedStudentSearch.value ?? '');

const studentQuery = useSparseQuery<ClassRuleStudentItem>({
  queryKeyPrefix: ['class-rule-students', props.ruleId],
  fetchFn: (params) => fetchClassRuleStudents(props.ruleId, params),
  filters: { name: studentSearchRef },
});

async function handleRemoveStudent(item: ClassRuleStudentItem) {
  const confirmed = await confirm({
    title: 'Remove Student',
    message: `Are you sure you want to remove "${item.student.name}" from this class rule?`,
    confirmText: 'Remove',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await removeClassRuleStudent(item.id);
    toast.success('Student removed from class rule successfully!');
    queryClient.invalidateQueries({ queryKey: ['class-rule-students', props.ruleId] });
  } catch {
    toast.error('Failed to remove student from class rule');
  }
}
</script>
