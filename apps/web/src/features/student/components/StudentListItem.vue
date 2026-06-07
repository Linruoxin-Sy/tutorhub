<template>
  <div class="flex items-center gap-3 whitespace-nowrap px-6 min-w-0">
    <div
      class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm"
      :style="{ background: getAvatarGradient(student.name) }"
    >
      {{ student.name.charAt(0) }}
    </div>
    <span class="truncate text-sm font-medium text-gray-900 dark:text-white">{{
      student.name
    }}</span>
  </div>
  <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
    {{ student.email || '-' }}
  </div>
  <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
    {{ student.phone || '-' }}
  </div>
  <div class="truncate whitespace-nowrap px-6 text-sm text-gray-600 dark:text-gray-300">
    {{ formatDateTime(student.createdAt) }}
  </div>
  <div class="flex items-center justify-end gap-1 whitespace-nowrap px-6">
    <button
      type="button"
      class="cursor-pointer rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
      @click="router.push('/student/' + student.id + '/edit')"
    >
      <i class="i-lucide-square-pen size-4"></i></button
    ><button
      type="button"
      class="cursor-pointer rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
      @click="handleDelete"
    >
      <i class="i-lucide-trash-2 size-4"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { formatDateTime } from '@/utils/date';
import { getAvatarGradient } from '@/utils/avatar';
import { useStudentDelete } from '@/features/student/hooks/useStudentDelete';
import type { Student } from '@tutorhub/database';

const props = defineProps<{
  student: Student;
}>();

const router = useRouter();
const { confirmAndDelete } = useStudentDelete();

async function handleDelete() {
  try {
    await confirmAndDelete({ id: props.student.id, name: props.student.name });
  } catch {
    // User cancelled or delete failed — nothing to do
  }
}
</script>
