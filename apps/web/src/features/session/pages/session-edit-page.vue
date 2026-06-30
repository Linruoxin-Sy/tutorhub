<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Edit Session" :description="`Editing session for rule ${ruleId}`" />

    <!-- Loading -->
    <CardSection v-if="isLoading" class="shrink-0 p-6">
      <LoadingIndicator text="Loading session data..." />
    </CardSection>

    <!-- ═══════ Create Override ═══════ -->
    <CardSection v-else class="shrink-0 space-y-5 p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create Override</h3>

      <!-- Original session info -->
      <div
        class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3a3a3a] dark:bg-[#1a1a1a]"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">Original Session</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
          {{ queryDate }} &middot; {{ queryStartTime }} – {{ queryEndTime }}
        </p>
        <p v-if="courseName" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Course: {{ courseName }}
        </p>
      </div>

      <!-- State selector -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Action <span class="text-red-500">*</span>
        </label>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition"
            :class="
              formState === 'CANCELLED'
                ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-400'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#2c2c2c]'
            "
            @click="formState = 'CANCELLED'"
          >
            <i class="i-lucide-x-circle mr-1 inline size-4" />
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition"
            :class="
              formState === 'RESCHEDULED'
                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-900/20 dark:text-amber-400'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#2c2c2c]'
            "
            @click="formState = 'RESCHEDULED'"
          >
            <i class="i-lucide-rotate-ccw mr-1 inline size-4" />
            Reschedule
          </button>
        </div>
      </div>

      <!-- Cancel info banner (only when CANCELLED) -->
      <div
        v-if="formState === 'CANCELLED'"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10"
      >
        <i class="i-lucide-info mt-0.5 inline size-5 shrink-0 text-red-500 dark:text-red-400" />
        <div>
          <p class="text-sm font-medium text-red-700 dark:text-red-400">
            This session will be cancelled
          </p>
          <p class="mt-0.5 text-sm text-red-600 dark:text-red-300/70">
            No charges will be applied for this session.
          </p>
        </div>
      </div>

      <!-- Reason (optional) -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Reason
          <span class="text-xs font-normal text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <input
          v-model="formReason"
          type="text"
          placeholder="e.g. Holiday adjustment"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      <!-- Reschedule fields (only when RESCHEDULED) -->
      <template v-if="formState === 'RESCHEDULED'">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            New Date <span class="text-red-500">*</span>
          </label>
          <VueDatePicker
            v-model="formRescheduledDate"
            model-type="yyyy-MM-dd"
            :dark="isDark"
            :ui="datePickerUi"
            :formats="{ input: 'yyyy-MM-dd' }"
            :enable-time-picker="false"
            :clearable="false"
            placeholder="Select new date"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            New Start Time <span class="text-red-500">*</span>
          </label>
          <VueDatePicker
            v-model="formRescheduledStartTime"
            model-type="HH:mm"
            :dark="isDark"
            :ui="datePickerUi"
            time-picker
            placeholder="Select new start time"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            New End Time <span class="text-red-500">*</span>
          </label>
          <VueDatePicker
            v-model="formRescheduledEndTime"
            model-type="HH:mm"
            :dark="isDark"
            :ui="datePickerUi"
            time-picker
            placeholder="Select new end time"
            class="w-full"
          />
        </div>

        <!-- Price Override (optional) -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Price Override
            <span class="text-xs font-normal text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="formPriceOverride"
              type="number"
              min="0"
              step="0.01"
              placeholder="Override class-rule price for this session"
              class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
            />
            <span class="shrink-0 text-sm text-gray-500 dark:text-gray-400">¥</span>
          </div>
        </div>

        <!-- Conflict check button -->
        <Transition
          mode="out-in"
          enter-active-class="transition duration-250"
          leave-active-class="transition duration-150"
          enter-from-class="opacity-0 scale-[0.92]"
          leave-to-class="opacity-0 scale-[0.92]"
        >
          <button
            v-if="!conflictPassed"
            key="conflict-check"
            :disabled="isChecking"
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            @click="runConflictCheck"
          >
            <span v-if="isChecking">Checking...</span>
            <span v-else>Conflict Check</span>
          </button>
          <button
            v-else
            key="create"
            :disabled="isSubmitting"
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            @click="doCreateOverride"
          >
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Create Override</span>
          </button>
        </Transition>
      </template>

      <!-- Create button for CANCELLED (no conflict check needed) -->
      <button
        v-if="formState === 'CANCELLED'"
        :disabled="isSubmitting"
        class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        @click="doCreateOverride"
      >
        <span v-if="isSubmitting">Saving...</span>
        <span v-else>Cancel Session</span>
      </button>

      <!-- Conflicts display -->
      <ListPageShell
        v-if="conflictResult && conflictResult.hasConflict"
        title="Schedule Conflicts Detected"
      >
        <div class="flex flex-col">
          <div class="flex h-64 flex-col gap-3 overflow-y-auto p-5">
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
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useRoute, useRouter } from 'vue-router';
import type { ClassSessionOverrideConflictCheckResponse } from '@tutorhub/schema';

import { fetchClassRuleById } from '@/features/class-rule/api/class-rule-api';
import {
  checkClassSessionOverrideConflicts,
  createClassSessionOverride,
} from '@/features/class-session/api/class-session-api';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import { useLoading } from '@/hooks/useLoading';
import SessionItem from '@/features/session/components/SessionItem.vue';
import CardSection from '@/components/CardSection.vue';
import PageHeader from '@/components/PageHeader.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import ListPageShell from '@/components/ListPageShell.vue';

const props = defineProps<{
  ruleId: string;
}>();

const router = useRouter();
const route = useRoute();
const query = route.query as Record<string, string>;
const queryDate = query.date ?? '';
const queryStartTime = query.startTime ?? '';
const queryEndTime = query.endTime ?? '';

const { isDark } = useThemeToggle();
const { withLoading, isLoadingRef: isSubmitting } = useLoading();

// ---- Data loading ----
const isLoading = ref(true);
const courseName = ref('');

// ---- Form state ----
const formState = ref<'CANCELLED' | 'RESCHEDULED'>('CANCELLED');
const formReason = ref('');
const formPriceOverride = ref<number | null>(null);
const formRescheduledDate = ref('');
const formRescheduledStartTime = ref('');
const formRescheduledEndTime = ref('');

// ---- Conflict check ----
const { withLoading: withChecking, isLoadingRef: isChecking } = useLoading();
const conflictResult = ref<ClassSessionOverrideConflictCheckResponse | null>(null);
const conflictPassed = ref(false);

onMounted(async () => {
  try {
    // Fetch rule data for course name context
    const rule = await fetchClassRuleById(props.ruleId);
    const data = rule as Record<string, unknown>;
    courseName.value = ((data.course as Record<string, unknown>)?.name as string) ?? '';

    // Pre-fill reschedule fields with original session data
    formRescheduledDate.value = queryDate;
    formRescheduledStartTime.value = queryStartTime;
    formRescheduledEndTime.value = queryEndTime;
  } catch {
    toast.error('Failed to load session data');
    goBack();
  } finally {
    isLoading.value = false;
  }
});

// Reset conflict pass when form changes
watch([formState, formRescheduledDate, formRescheduledStartTime, formRescheduledEndTime], () => {
  if (conflictPassed.value) {
    conflictPassed.value = false;
    conflictResult.value = null;
  }
});

const runConflictCheck = withChecking(async () => {
  if (
    !formRescheduledDate.value ||
    !formRescheduledStartTime.value ||
    !formRescheduledEndTime.value
  ) {
    toast.warning('Please fill in new date, start time, and end time');
    return;
  }

  try {
    const res = await checkClassSessionOverrideConflicts({
      classRuleId: props.ruleId,
      originalDate: new Date(formRescheduledDate.value + 'T00:00:00.000Z'),
      newStartTime: formRescheduledStartTime.value,
      newEndTime: formRescheduledEndTime.value,
    });
    conflictResult.value = res;
    if (res.hasConflict) {
      toast.error('Time conflict detected!');
    } else {
      toast.success('No conflicts, you can proceed');
      conflictPassed.value = true;
    }
  } catch {
    toast.error('Failed to check conflicts');
  }
});

const doCreateOverride = withLoading(async () => {
  const payload: Record<string, unknown> = {
    classRuleId: props.ruleId,
    originalDate: queryDate + 'T00:00:00.000Z',
    state: formState.value,
    priceOverride: formState.value === 'CANCELLED' ? null : (formPriceOverride.value ?? null),
    reason: formReason.value || null,
  };

  if (formState.value === 'RESCHEDULED') {
    if (
      !formRescheduledDate.value ||
      !formRescheduledStartTime.value ||
      !formRescheduledEndTime.value
    ) {
      toast.warning('Please fill in all reschedule fields');
      return;
    }
    payload.rescheduledDate = formRescheduledDate.value + 'T00:00:00.000Z';
    payload.rescheduledStartTime = formRescheduledStartTime.value;
    payload.rescheduledEndTime = formRescheduledEndTime.value;
  }

  try {
    await createClassSessionOverride(payload);
    toast.success('Session override created successfully!');
    goBack();
  } catch {
    toast.error('Failed to save session override');
  }
});

function goBack() {
  router.push({ name: 'class-rule.detail', params: { ruleId: props.ruleId } });
}
</script>
