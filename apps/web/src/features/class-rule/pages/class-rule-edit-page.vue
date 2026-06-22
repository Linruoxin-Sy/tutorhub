<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader
        title="Edit Class Rule"
        description="Modify the class schedule rule for this enrollment."
      />

      <!-- 加载中 -->
      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading class rule data..." />
      </CardSection>

      <!-- 表单卡片 -->
      <CardSection v-else class="space-y-5 p-6">
        <!-- 日期选择 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Start Date <span class="text-red-500">*</span>
          </label>
          <VueDatePicker
            v-model="startDateModel"
            :format="dateFormat"
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
            v-model="startTimeModel"
            time-picker
            :format="timeFormat"
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
            v-model="endTimeModel"
            time-picker
            :format="timeFormat"
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
            v-model="endDateModel"
            :format="dateFormat"
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

      <!-- 底部卡片：生成的具体课程 -->
      <CardSection
        v-if="
          isValidated &&
          generatedSessions.length > 0 &&
          conflictResult &&
          !conflictResult.hasConflict
        "
        class="p-5"
      >
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Generated Sessions ({{ generatedSessions.length }})
        </h3>
        <div
          ref="sessionListRef"
          class="flex max-h-96 scrollbar-none flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          @scroll="handleScroll"
        >
          <SessionItem
            v-for="session in displayedSessions"
            :key="session.occurrenceDate"
            :student-name="studentName"
            :course-name="courseName"
            :date="session.occurrenceDate"
            :start-time="session.startTime"
            :end-time="session.endTime"
            :actions="['change']"
            @change="handleChangeSession(session)"
          />
          <div
            v-if="hasMoreSessions"
            class="py-4 text-center text-sm text-gray-400 dark:text-gray-500"
          >
            Scroll down to load more sessions...
          </div>
        </div>
      </CardSection>

      <!-- 底部卡片：冲突课程 -->
      <CardSection v-if="conflictResult && conflictResult.hasConflict" class="space-y-3 p-5">
        <div class="flex items-center gap-2">
          <i class="i-lucide-alert-triangle size-5 text-red-500" />
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
            Schedule Conflicts Detected
          </h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          The following sessions conflict with existing class rules. Please adjust the schedule and
          try again.
        </p>
        <div class="flex max-h-96 flex-col gap-3 overflow-y-auto">
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
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dayjs from 'dayjs';
import type { GeneratedSession } from '@tutorhub/schema';
import SessionItem from '@/features/session/components/SessionItem.vue';
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
  displayedSessions,
  hasMoreSessions,
  isInfinite,
  isSubmitting,
  studentName,
  courseName,
  loadMoreSessions,
  submit,
} = useClassRuleEditForm(props.enrollmentId, props.ruleId);

// ---- VueDatePicker 双向绑定辅助 ----

function dateFormat(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

function timeFormat(date: Date): string {
  return dayjs(date).format('HH:mm');
}

const startDateModel = computed({
  get: () => (formData.value.startDate ? dayjs(formData.value.startDate).toDate() : null),
  set: (val: Date | null) => {
    formData.value.startDate = val ? dayjs(val).format('YYYY-MM-DD') : '';
  },
});

const startTimeModel = computed({
  get: () =>
    formData.value.startTime ? dayjs(`2000-01-01 ${formData.value.startTime}`).toDate() : null,
  set: (val: Date | null) => {
    formData.value.startTime = val ? dayjs(val).format('HH:mm') : '';
  },
});

const endTimeModel = computed({
  get: () =>
    formData.value.endTime ? dayjs(`2000-01-01 ${formData.value.endTime}`).toDate() : null,
  set: (val: Date | null) => {
    formData.value.endTime = val ? dayjs(val).format('HH:mm') : '';
  },
});

const endDateModel = computed({
  get: () => (formData.value.endDate ? dayjs(formData.value.endDate).toDate() : null),
  set: (val: Date | null) => {
    formData.value.endDate = val ? dayjs(val).format('YYYY-MM-DD') : '';
  },
});

const intervalDaysModel = computed({
  get: () => formData.value.intervalDays,
  set: (val: number | null) => {
    formData.value.intervalDays = val;
    if (val === null) {
      formData.value.endDate = '';
    }
  },
});

// ---- 虚拟滚动 ----
const sessionListRef = ref<HTMLElement | null>(null);

function handleScroll(event: Event) {
  const el = event.target as HTMLElement;
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
    loadMoreSessions();
  }
}

function handleChangeSession(_session: GeneratedSession) {
  // TODO: implement change session override
  void _session;
}
</script>
