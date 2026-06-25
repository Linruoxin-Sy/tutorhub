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

      <!-- Submit button (two-phase state machine) -->
      <template v-if="!conflictPassed">
        <!-- Phase 1: Conflict check -->
        <button
          :disabled="!hasChanges || isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="runConflictCheck"
        >
          <span v-if="!hasChanges">No changes</span>
          <span v-else-if="isSubmitting">Checking...</span>
          <span v-else>Conflict Check</span>
        </button>
      </template>
      <template v-else>
        <!-- Phase 2: Update class rule -->
        <button
          :disabled="isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="doUpdate"
        >
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>Update Class Rule</span>
        </button>
      </template>
    </CardSection>

    <!-- Generated sessions -->
    <ListPageShell v-if="conflictPassed && generatedSessions.length > 0" title="Generated Sessions">
      <template #actions>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ generatedSessions.length }} session(s)
        </span>
      </template>

      <div class="flex flex-col">
        <VirtualList
          :query="sessionQuery"
          :estimate-size="90"
          :overscan="10"
          scroll-class="max-h-80 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #item="{ item }">
            <SessionItem
              v-if="item"
              course-name="Course"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
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
        <div class="flex max-h-80 flex-col gap-3 overflow-y-auto p-5">
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
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import { useClassRuleEditForm } from '@/features/class-rule/hooks/useClassRuleEditForm';

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
  isInfinite,
  isSubmitting,
  runConflictCheck,
  doUpdate,
} = useClassRuleEditForm(props.courseId, props.ruleId);

const { isDark } = useThemeToggle();
const sessionQuery = useLocalQuery(generatedSessions);

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
</script>
