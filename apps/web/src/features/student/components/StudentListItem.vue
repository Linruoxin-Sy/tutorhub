<template>
  <div
    ref="cardRef"
    class="transition-all duration-700 origin-bottom-right"
    :class="isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-16 scale-80 opacity-0'"
    style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1.2fr 0.8fr; align-items: center"
  >
    <div class="flex items-center gap-3 whitespace-nowrap px-6 min-w-0">
      <img
        v-if="studentAvatarUrl"
        :src="studentAvatarUrl"
        class="size-9 shrink-0 rounded-full object-cover shadow-sm"
        alt=""
      />
      <div
        v-else
        class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm"
        :style="{
          background: getAvatarGradient(student.name),
          color: getAvatarTextColor(student.name),
        }"
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useTemplateRef } from 'vue';
import { formatDateTime } from '@/utils/date';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { useStudentDelete } from '@/features/student/hooks/useStudentDelete';
import { useElementInView } from '@/hooks/useElementInView';
import type { Student } from '@tutorhub/database';

/** 从 API 列表接口返回的学生对象不包含 avatarKey，但包含 avatarUrl */
type StudentListItemData = Omit<Student, 'avatarKey'> & { avatarUrl?: string | null };

const props = defineProps<{
  student: StudentListItemData;
}>();

const studentAvatarUrl = computed(
  () => (props.student as Record<string, unknown>).avatarUrl as string | undefined,
);

const router = useRouter();
const { confirmAndDelete } = useStudentDelete();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isVisible } = useElementInView(cardRef);

async function handleDelete() {
  try {
    await confirmAndDelete({ id: props.student.id, name: props.student.name });
  } catch {
    // User cancelled or delete failed — nothing to do
  }
}
</script>
