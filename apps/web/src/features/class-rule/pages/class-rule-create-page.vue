<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Create Class Rule"
      description="Define a new class schedule rule for this course."
    />

    <!-- 表单卡片 -->
    <CardSection class="shrink-0 space-y-5 p-6">
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

      <!-- 渐进式：循环间隔 -->
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
        <p class="text-xs text-gray-400 dark:text-gray-500">
          Leave empty for a single session, or set a number to make it recurring.
        </p>
      </div>

      <!-- 渐进式：结束日期（仅当有循环间隔时显示） -->
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
        <p v-else class="text-xs text-gray-400 dark:text-gray-500">
          Leave empty for infinite recurring.
        </p>
      </div>

      <!-- 提交按钮（两阶段状态机） -->
      <template v-if="!conflictPassed">
        <!-- Phase 1: 冲突检测 -->
        <button
          :disabled="!isFormComplete || isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="runConflictCheck"
        >
          <span v-if="isSubmitting">Checking...</span>
          <span v-else>冲突检测</span>
        </button>
      </template>
      <template v-else>
        <!-- Phase 2: 创建上课规则 -->
        <button
          :disabled="isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="doCreate"
        >
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>创建上课规则</span>
        </button>
      </template>
    </CardSection>

    <!-- 生成的具体课程 -->
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

    <!-- 冲突课程 -->
    <ListPageShell
      v-if="conflictResult && conflictResult.hasConflict"
      title="Schedule Conflicts Detected"
    >
      <div class="flex flex-col">
        <div class="flex max-h-80 flex-col gap-3 overflow-y-auto p-5">
          <SessionItem
            v-for="conflict in conflictResult.conflicts"
            :key="conflict.date + conflict.startTime"
            course-name="Conflict"
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
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import { useClassRuleCreateForm } from '@/features/class-rule/hooks/useClassRuleCreateForm';

const props = defineProps<{
  courseId: string;
}>();

const {
  formData,
  conflictResult,
  conflictPassed,
  generatedSessions,
  isInfinite,
  isFormComplete,
  isSubmitting,
  runConflictCheck,
  doCreate,
} = useClassRuleCreateForm(props.courseId);

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
