<template>
  <form class="space-y-6" @submit.prevent>
    <!-- Name + Status -->
    <div class="grid gap-6 md:grid-cols-2">
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
          placeholder="Course name"
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
        <p
          v-else
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.name }}
        </p>
      </div>

      <!-- Status -->
      <div class="space-y-2">
        <label
          :for="field.id('status')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Status
        </label>
        <SelectInput
          v-if="!readonly"
          :id="field.id('status')"
          v-model="model.status"
          size="md"
          class="w-full"
        >
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </SelectInput>
        <p
          v-else
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-[#3a3a3a] dark:bg-[#202020]"
        >
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              model.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-[#343434] dark:text-gray-400'
            "
          >
            <span
              class="size-1.5 rounded-full"
              :class="model.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'"
            ></span>
            {{ model.status === 'ACTIVE' ? 'Active' : 'Disabled' }}
          </span>
        </p>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label
        :for="field.id('description')"
        class="text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        Description
      </label>
      <textarea
        v-if="!readonly"
        :id="field.id('description')"
        v-model="model.description"
        rows="4"
        placeholder="Course description..."
        class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
      ></textarea>
      <p
        v-else
        class="min-h-20 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm whitespace-pre-wrap text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
      >
        {{ model.description || 'No description provided.' }}
      </p>
    </div>

    <!-- Actions slot (only shown in editable mode) -->
    <div v-if="!readonly">
      <slot name="actions" />
    </div>
  </form>
</template>

<script setup lang="ts">
import type { CourseFormData } from '@/features/course/types/courseForm';
import { useField } from '@/hooks/useField';

const model = defineModel<CourseFormData>({
  required: true,
});

withDefaults(
  defineProps<{
    readonly?: boolean;
  }>(),
  {
    readonly: false,
    createdAt: null,
    updatedAt: null,
  },
);

const field = useField();
</script>
