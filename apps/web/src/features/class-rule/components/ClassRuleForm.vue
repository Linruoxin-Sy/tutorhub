<template>
  <form class="space-y-6" @submit.prevent>
    <!-- Name -->
    <div class="space-y-2">
      <label :for="field.id('name')" class="text-sm font-medium text-gray-700 dark:text-gray-200">
        Name <span v-if="!readonly" class="text-red-500">*</span>
      </label>
      <input
        v-if="!readonly"
        :id="field.id('name')"
        v-model.trim="model.name"
        type="text"
        placeholder="e.g. Weekend Class"
        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
      />
      <p
        v-else
        class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.name }}
      </p>
    </div>

    <!-- Price -->
    <div class="space-y-2">
      <label :for="field.id('price')" class="text-sm font-medium text-gray-700 dark:text-gray-200">
        Price <span v-if="!readonly" class="text-red-500">*</span>
      </label>
      <div v-if="!readonly" class="flex items-center gap-3">
        <input
          :id="field.id('price')"
          v-model.number="model.price"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 200"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
        <span class="shrink-0 text-sm text-gray-500 dark:text-gray-400">¥</span>
      </div>
      <p
        v-else
        class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.price != null ? `¥${Number(model.price).toFixed(2)}` : '—' }}
      </p>
    </div>

    <!-- Start Date & End Date -->
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1 space-y-2">
        <label
          :for="field.id('startDate')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {{ model.isRecurring ? 'Start Date' : 'Date' }}
          <span v-if="!readonly" class="text-red-500">*</span>
        </label>
        <VueDatePicker
          v-if="!readonly"
          :id="field.id('startDate')"
          v-model="model.startDate"
          model-type="yyyy-MM-dd"
          :dark="isDark"
          :ui="datePickerUi"
          :formats="{ input: 'yyyy-MM-dd' }"
          :enable-time-picker="false"
          :clearable="false"
          placeholder="Select start date"
          class="w-full"
        />
        <p
          v-else
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.startDate }}
        </p>
      </div>

      <div v-if="model.isRecurring" class="flex shrink-0 items-center pt-9">
        <i class="i-lucide-arrow-right text-gray-400 dark:text-gray-500" />
      </div>

      <div v-if="model.isRecurring" class="min-w-0 flex-1 space-y-2">
        <label
          :for="field.id('endDate')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          End Date
          <span v-if="!readonly" class="text-xs font-normal text-gray-400 dark:text-gray-500"
            >(optional)</span
          >
        </label>
        <VueDatePicker
          v-if="!readonly"
          :id="field.id('endDate')"
          v-model="model.endDate"
          model-type="yyyy-MM-dd"
          :dark="isDark"
          :ui="datePickerUi"
          :formats="{ input: 'yyyy-MM-dd' }"
          :enable-time-picker="false"
          :clearable="true"
          placeholder="Leave empty for infinite"
          class="w-full"
        />
        <p
          v-else
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.endDate || 'Infinite' }}
        </p>
      </div>
    </div>

    <!-- Start & End Time -->
    <div class="flex items-start gap-3">
      <div class="flex-1 space-y-2">
        <label
          :for="field.id('startTime')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Start Time <span v-if="!readonly" class="text-red-500">*</span>
        </label>
        <VueDatePicker
          v-if="!readonly"
          :id="field.id('startTime')"
          v-model="model.startTime"
          model-type="HH:mm"
          :dark="isDark"
          :ui="datePickerUi"
          time-picker
          placeholder="Start time"
          class="w-full"
        />
        <p
          v-else
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.startTime }}
        </p>
      </div>

      <div class="flex shrink-0 items-center pt-9">
        <i class="i-lucide-arrow-right text-gray-400 dark:text-gray-500" />
      </div>

      <div class="flex-1 space-y-2">
        <label
          :for="field.id('endTime')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          End Time <span v-if="!readonly" class="text-red-500">*</span>
        </label>
        <VueDatePicker
          v-if="!readonly"
          :id="field.id('endTime')"
          v-model="model.endTime"
          model-type="HH:mm"
          :dark="isDark"
          :ui="datePickerUi"
          time-picker
          placeholder="End time"
          class="w-full"
        />
        <p
          v-else
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.endTime }}
        </p>
      </div>
    </div>

    <!-- Recurring toggle -->
    <div v-if="!readonly" class="flex items-center gap-3">
      <label class="relative inline-flex cursor-pointer items-center">
        <input v-model="model.isRecurring" type="checkbox" class="peer sr-only" />
        <div
          class="h-5 w-9 rounded-full border-2 border-gray-300 bg-gray-100 transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:inset-s-0.75 after:top-0.75 after:size-3.5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:after:translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500"
        />
      </label>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-200"> Recurring course </span>
      <p
        v-if="model.isRecurring && !model.endDate"
        class="text-xs text-amber-600 dark:text-amber-400"
      >
        This rule will repeat indefinitely.
      </p>
    </div>

    <!-- Repeat interval (only when recurring) -->
    <div v-if="model.isRecurring" class="space-y-2">
      <label
        :for="field.id('intervalDays')"
        class="text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Repeat Every N Days <span class="text-red-500">*</span>
      </label>
      <div v-if="!readonly" class="flex items-center gap-3">
        <input
          :id="field.id('intervalDays')"
          v-model.number="intervalDaysModel"
          type="number"
          min="1"
          placeholder="e.g. 7"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
        <span class="shrink-0 text-sm text-gray-500 dark:text-gray-400">day(s)</span>
      </div>
      <p
        v-else
        class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.intervalDays != null ? `Every ${model.intervalDays} day(s)` : 'Single session' }}
      </p>
    </div>

    <!-- Actions slot (only in editable mode) -->
    <div v-if="!readonly">
      <slot name="actions" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { datePickerUi } from '@/features/class-rule/constants/datePickerUi';
import { useField } from '@/hooks/useField';
import type { ClassRuleFormData } from '@/features/class-rule/types/classRuleForm';

const model = defineModel<ClassRuleFormData>({
  required: true,
});

withDefaults(
  defineProps<{
    readonly?: boolean;
  }>(),
  { readonly: false },
);

const field = useField();
const { isDark } = useThemeToggle();

// Clear interval/endDate when recurring is turned off
watch(
  () => model.value.isRecurring,
  (newVal) => {
    if (!newVal) {
      model.value.intervalDays = null;
      model.value.endDate = '';
    }
  },
);

// VueDatePicker binds string → number via v-model.number but for null we need a bridge
const intervalDaysModel = computed({
  get: () => model.value.intervalDays,
  set: (val: unknown) => {
    const num = typeof val === 'number' ? val : Number(val);
    model.value.intervalDays = Number.isFinite(num) ? num : null;
    if (model.value.intervalDays === null) {
      model.value.endDate = '';
    }
  },
});
</script>
