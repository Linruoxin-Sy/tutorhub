<template>
  <article
    ref="itemRef"
    class="relative flex h-36 origin-bottom-right cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-lg dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="[
      isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-32 scale-80 opacity-0',
      !loading && selected
        ? 'shadow-[0_0_20px_-4px] ring-3 shadow-blue-500/40 ring-blue-500/50'
        : '',
    ]"
    @click="!loading && emit('view')"
  >
    <!-- 选中蒙层（仅真实内容） -->
    <div
      v-if="!loading && selected"
      class="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-blue-500/15"
    />

    <!-- ===== Skeleton 状态 ===== -->
    <template v-if="loading">
      <div class="bg-linear-to-r from-blue-500 to-indigo-600 px-5 py-4">
        <div class="h-5 w-48 animate-pulse rounded bg-white/30" />
      </div>
      <div class="flex flex-1 items-start justify-between gap-4 px-5 py-4">
        <div class="min-w-0 flex-1 space-y-3">
          <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          <div class="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div class="flex shrink-0 gap-2 self-end">
          <div class="h-8 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
          <div class="h-8 w-18 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
        </div>
      </div>
    </template>

    <!-- ===== 真实内容 ===== -->
    <template v-else>
      <div class="px-5 py-4" :style="{ background: getAvatarGradient(course!.name) }">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold" :style="{ color: getAvatarTextColor(course!.name) }">
              {{ course!.name }}
            </h3>
          </div>
          <span
            class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold"
            :style="{ color: getAvatarTextColor(course!.name) }"
          >
            {{ course!.status }}
          </span>
        </div>
      </div>
      <div class="flex flex-1 items-start justify-between gap-4 px-5 py-4">
        <div class="min-w-0 flex-1 space-y-2">
          <p class="truncate text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {{ course!.description || 'No description provided.' }}
          </p>
          <span class="block text-xs text-gray-500 dark:text-gray-400">
            Created {{ formatDateTime(course!.createdAt) }}
          </span>
        </div>
        <div v-if="actions.length" class="flex shrink-0 gap-2 self-end">
          <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
          <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
        </div>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/date';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { useTemplateRef } from 'vue';
import { useElementInView } from '@/hooks/useElementInView';
import type { Course } from '@tutorhub/database';

withDefaults(
  defineProps<{
    course?: Course;
    actions?: ('edit' | 'delete')[];
    selected?: boolean;
    loading?: boolean;
  }>(),
  {
    course: undefined,
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

const itemRef = useTemplateRef<HTMLElement>('itemRef');
const { isVisible } = useElementInView(itemRef);
</script>
