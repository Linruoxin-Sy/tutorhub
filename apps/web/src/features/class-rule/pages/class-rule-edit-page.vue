<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Edit Class Rule"
      description="Modify the class schedule rule for this enrollment."
    />

    <!-- 加载中 -->
    <CardSection v-if="isInitialLoading" class="shrink-0 p-6">
      <LoadingIndicator text="Loading class rule data..." />
    </CardSection>

    <!-- 表单卡片 -->
    <CardSection v-else class="shrink-0 space-y-5 p-6">
      <!-- 日期选择 -->
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

      <!-- 开始时间 -->
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

      <!-- 结束时间 -->
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

      <!-- 循环间隔 -->
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

      <!-- 结束日期 -->
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

      <!-- 保存按钮 -->
      <button
        :disabled="isSubmitting"
        class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        @click="submit"
      >
        <span v-if="isSubmitting">Saving...</span>
        <span v-else>Save Changes</span>
      </button>
    </CardSection>

    <!-- 生成的具体课程 -->
    <ListPageShell
      v-if="
        isValidated && generatedSessions.length > 0 && conflictResult && !conflictResult.hasConflict
      "
      title="Generated Sessions"
    >
      <template #actions>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ generatedSessions.length }} session(s)
        </span>
      </template>

      <div class="flex min-h-0 flex-1 flex-col">
        <VirtualList
          :query="sessionQuery"
          :estimate-size="90"
          :overscan="10"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #item="{ item }">
            <SessionItem
              v-if="item"
              :student-name="studentName"
              :course-name="courseName"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
              :actions="['change']"
              @change="handleChangeSession(item)"
            />
          </template>
        </VirtualList>
      </div>
    </ListPageShell>

    <!-- 冲突课程 -->
    <ListPageShell
      v-if="conflictResult && conflictResult.hasConflict"
      title="Schedule Conflicts Detected"
    >
      <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex max-h-96 flex-col gap-3 overflow-y-auto p-5">
          <SessionItem
            v-for="conflict in conflictResult.conflicts"
            :key="conflict.date + conflict.startTime"
            :student-name="studentName"
            :course-name="courseName"
            :date="conflict.date"
            :start-time="conflict.startTime"
            :end-time="conflict.endTime"
            :conflict="true"
          />
        </div>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import type { GeneratedSession } from '@tutorhub/schema';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import { useClassRuleEditForm } from '@/features/class-rule/hooks/useClassRuleEditForm';

const props = defineProps<{
  enrollmentId: string;
  ruleId: string;
}>();

const {
  formData,
  isInitialLoading,
  isValidated,
  conflictResult,
  generatedSessions,
  isInfinite,
  isSubmitting,
  studentName,
  courseName,
  submit,
} = useClassRuleEditForm(props.enrollmentId, props.ruleId);

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

function handleChangeSession(_session: GeneratedSession) {
  // TODO: implement change session override
  void _session;
}
</script>
