<template>
  <div
    ref="itemRef"
    class="relative origin-bottom-right cursor-pointer transition-all duration-700"
    :class="[
      isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-16 scale-80 opacity-0',
      !loading && selected ? 'bg-blue-500/10' : '',
    ]"
    style="
      display: grid;
      grid-template-columns: 1.5fr 2fr 1.2fr 1.2fr 1fr;
      align-items: center;
      width: 100%;
    "
    @click="!loading && emit('view')"
  >
    <!-- 选中指示器（仅真实内容） -->
    <div
      v-if="!loading && selected"
      class="pointer-events-none absolute top-0 left-0 h-full w-1 rounded-r-sm bg-blue-500"
    />

    <!-- ===== Skeleton 状态 ===== -->
    <template v-if="loading">
      <div class="flex items-center gap-3 px-6 whitespace-nowrap">
        <div class="size-9 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-[#343434]" />
        <div class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
      </div>
      <div class="px-6">
        <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
      </div>
      <div class="px-6">
        <div class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
      </div>
      <div class="px-6">
        <div class="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
      </div>
      <div class="flex items-center justify-end gap-1 px-6">
        <div class="size-8 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
        <div class="size-8 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
      </div>
    </template>

    <!-- ===== 真实内容 ===== -->
    <template v-else>
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
            background: getAvatarGradient(student!.name),
            color: getAvatarTextColor(student!.name),
          }"
        >
          {{ student!.name.charAt(0) }}
        </div>
        <span class="truncate text-sm font-medium text-gray-900 dark:text-white">{{
          student!.name
        }}</span>
      </div>
      <div class="truncate px-6 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
        {{ student!.email || '-' }}
      </div>
      <div class="truncate px-6 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
        {{ student!.phone || '-' }}
      </div>
      <div class="truncate px-6 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
        {{ formatDateTime(student!.createdAt) }}
      </div>
      <div
        v-if="actions.length"
        class="flex items-center justify-start gap-1 px-6 whitespace-nowrap"
      >
        <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
        <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
      </div>
    </template>
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
    student?: StudentItemData;
    actions?: ('edit' | 'delete')[];
    selected?: boolean;
    loading?: boolean;
  }>(),
  {
    student: undefined,
    actions: () => ['edit', 'delete'],
    selected: false,
    loading: false,
  },
);

const emit = defineEmits<{
  view: [];
  edit: [];
  delete: [];
}>();

const studentAvatarUrl = computed(
  () => (props.student as Record<string, unknown> | undefined)?.avatarUrl as string | undefined,
);

const itemRef = useTemplateRef<HTMLElement>('itemRef');
const { isVisible } = useElementInView(itemRef);
</script>
