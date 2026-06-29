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

    <!-- Start Date -->
    <div class="space-y-2">
      <label
        :for="field.id('startDate')"
        class="text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Start Date <span v-if="!readonly" class="text-red-500">*</span>
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

    <!-- Start Time -->
    <div class="space-y-2">
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
        placeholder="Select start time"
        class="w-full"
      />
      <p
        v-else
        class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.startTime }}
      </p>
    </div>

    <!-- End Time -->
    <div class="space-y-2">
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
        placeholder="Select end time"
        class="w-full"
      />
      <p
        v-else
        class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.endTime }}
      </p>
    </div>

    <!-- Repeat interval -->
    <div class="space-y-2">
      <label
        :for="field.id('intervalDays')"
        class="text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Repeat Every N Days
        <span v-if="!readonly" class="text-xs font-normal text-gray-400 dark:text-gray-500"
          >(optional)</span
        >
      </label>
      <div v-if="!readonly" class="flex items-center gap-3">
        <input
          :id="field.id('intervalDays')"
          v-model.number="intervalDaysModel"
          type="number"
          min="1"
          placeholder="Leave empty for single session"
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
      <p
        v-if="!readonly && model.intervalDays !== null"
        class="text-xs text-gray-400 dark:text-gray-500"
      >
        Leave empty for single session, or set a number to make it recurring.
      </p>
    </div>

    <!-- End date (only shown when interval is set) -->
    <div v-if="model.intervalDays !== null" class="space-y-2">
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
        placeholder="Leave empty for infinite recurring"
        class="w-full"
      />
      <p
        v-else
        class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.endDate || 'Infinite' }}
      </p>
      <p
        v-if="!readonly && model.intervalDays !== null && !model.endDate"
        class="text-xs text-amber-600 dark:text-amber-400"
      >
        This rule will repeat indefinitely.
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
