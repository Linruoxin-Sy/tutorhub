<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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

    <!-- 选择学生 -->
    <ListPageShell title="Select Students">
      <template #filters>
        <SearchInput v-model="search" placeholder="Search enrolled students..." />
      </template>

      <template #actions>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ selectedStudentIds.size }} student(s) selected
        </span>
      </template>

      <VirtualList
        :query="enrolledQuery"
        :estimate-size="70"
        :overscan="10"
        scroll-class="max-h-96 overflow-x-hidden overflow-y-auto"
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
            :actions="[]"
            :selected="!!item && selectedStudentIds.has(item.student.id)"
            @view="item && toggleStudent(item.student.id)"
          />
        </template>

        <template #empty>
          <div
            class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
          >
            No enrolled students found.
          </div>
        </template>
      </VirtualList>
    </ListPageShell>

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
import { computed, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import type { GeneratedSession } from '@tutorhub/schema';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import { fetchCourseEnrollments } from '@/features/enrollment/api/enrollment-api';
import SessionItem from '@/features/session/components/SessionItem.vue';
import StudentItem from '@/features/student/components/StudentItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import SearchInput from '@/components/SearchInput.vue';
import { useClassRuleEditForm } from '@/features/class-rule/hooks/useClassRuleEditForm';
import type { CourseEnrollmentListResponse } from '@tutorhub/schema';

type EnrollmentItem = CourseEnrollmentListResponse['items'][number];

const props = defineProps<{
  courseId: string;
  ruleId: string;
}>();

const {
  formData,
  selectedStudentIds,
  toggleStudent,
  isInitialLoading,
  isValidated,
  conflictResult,
  generatedSessions,
  isInfinite,
  isSubmitting,
  submit,
} = useClassRuleEditForm(props.courseId, props.ruleId);

const columns = ['Name', 'Email', 'Phone', 'Created At', 'Status'];

const search = ref('');
const debouncedSearch = refDebounced(search, 300);
const searchRef = computed(() => debouncedSearch.value ?? '');

const enrolledQuery = useSparseQuery<EnrollmentItem>({
  queryKeyPrefix: ['course-enrollments', props.courseId],
  fetchFn: (params) => fetchCourseEnrollments(props.courseId, params),
  filters: { name: searchRef },
});

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
