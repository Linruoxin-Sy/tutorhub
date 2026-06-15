<template>
  <div
    ref="cardRef"
    class="origin-bottom-right cursor-pointer transition-all duration-700"
    :class="isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-16 scale-80 opacity-0'"
    style="
      display: grid;
      grid-template-columns: 1.5fr 2fr 1.2fr 1.2fr 1fr;
      align-items: center;
      width: 100%;
    "
    @click="emit('view')"
  >
    <div class="flex min-w-0 items-center gap-3 px-6 whitespace-nowrap">
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
    <div class="truncate px-6 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
      {{ student.email || '-' }}
    </div>
    <div class="truncate px-6 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
      {{ student.phone || '-' }}
    </div>
    <div class="truncate px-6 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
      {{ formatDateTime(student.createdAt) }}
    </div>
    <div v-if="actions.length" class="flex items-center justify-start gap-1 px-6 whitespace-nowrap">
      <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
      <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { formatDateTime } from '@/utils/date';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { useElementInView } from '@/hooks/useElementInView';
import type { Student } from '@tutorhub/database';

/** 从 API 列表接口返回的学生对象不包含 avatarKey，但包含 avatarUrl */
type StudentItemData = Omit<Student, 'avatarKey'> & { avatarUrl?: string | null };

const props = withDefaults(
  defineProps<{
    student: StudentItemData;
    actions?: ('edit' | 'delete')[];
  }>(),
  {
    actions: () => ['edit', 'delete'],
  },
);

const emit = defineEmits<{
  view: [];
  edit: [];
  delete: [];
}>();

const studentAvatarUrl = computed(
  () => (props.student as Record<string, unknown>).avatarUrl as string | undefined,
);

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isVisible } = useElementInView(cardRef);
</script>
