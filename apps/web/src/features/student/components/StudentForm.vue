<template>
  <form class="space-y-6" @submit.prevent>
    <!-- Avatar row -->
    <div class="flex justify-center">
      <AvatarUploader v-if="!readonly" :name="model.name" @pending-file="handleAvatarFile" />
      <div
        v-else
        class="size-24 overflow-hidden rounded-full border-2 border-gray-200 shadow-sm dark:border-[#4a4a4a]"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="size-full rounded-full object-cover"
          alt="Avatar"
        />
        <div
          v-else
          class="flex size-full items-center justify-center rounded-full text-xl font-bold"
          :style="{
            background: getAvatarGradient(model.name),
            color: getAvatarTextColor(model.name),
          }"
        >
          {{ model.name?.charAt(0)?.toUpperCase() ?? '?' }}
        </div>
      </div>
    </div>

    <!-- 4 fields in 2x2 grid -->
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
          placeholder="Student name"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
        <p
          v-else
          class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.name }}
        </p>
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <label
          :for="field.id('email')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Email
        </label>
        <input
          v-if="!readonly"
          :id="field.id('email')"
          v-model.trim="model.email"
          type="email"
          placeholder="student@example.com"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
        <p
          v-else
          class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.email || '-' }}
        </p>
      </div>

      <!-- Phone -->
      <div class="space-y-2">
        <label
          :for="field.id('phone')"
          class="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Phone
        </label>
        <input
          v-if="!readonly"
          :id="field.id('phone')"
          v-model.trim="model.phone"
          type="text"
          inputmode="numeric"
          placeholder="Phone number"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        />
        <p
          v-else
          class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.phone || '-' }}
        </p>
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
          placeholder="Additional notes about the student..."
          class="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
        ></textarea>
        <p
          v-else
          class="min-h-24 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
        >
          {{ model.description || '-' }}
        </p>
      </div>
    </div>

    <!-- Actions slot (only shown in editable mode) -->
    <div v-if="!readonly">
      <slot name="actions" />
    </div>
  </form>
</template>

<script setup lang="ts">
import type { StudentForm } from '@/features/student/types/studentForm';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { useField } from '@/hooks/useField';

const model = defineModel<StudentForm>({
  required: true,
});

withDefaults(
  defineProps<{
    readonly?: boolean;
    avatarUrl?: string | null;
  }>(),
  {
    readonly: false,
    avatarUrl: null,
  },
);

const emit = defineEmits<{
  avatarChange: [value: Blob | null];
}>();

const field = useField();

function handleAvatarFile(file: Blob | null) {
  emit('avatarChange', file);
}
</script>
