<template>
  <article
    ref="cardRef"
    class="flex h-36 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all duration-700 dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="isVisible ? 'translate-x-0 opacity-100' : 'translate-x-32 opacity-0'"
  >
    <div class="px-5 py-4" :style="{ background: getAvatarGradient(course.name) }">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold" :style="{ color: getAvatarTextColor(course.name) }">
            {{ course.name }}
          </h3>
        </div>
        <span
          class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold"
          :style="{ color: getAvatarTextColor(course.name) }"
          >{{ course.status }}</span
        >
      </div>
    </div>
    <div class="flex flex-1 items-start justify-between gap-4 px-5 py-4">
      <div class="min-w-0 flex-1 space-y-2">
        <p class="truncate text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {{ course.description || 'No description provided.' }}
        </p>
        <span class="block text-xs text-gray-500 dark:text-gray-400">
          Created {{ formatDateTime(course.createdAt) }}
        </span>
      </div>
      <div class="flex shrink-0 self-end gap-2">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
          @click="router.push(`/course/${course.id}/edit`)"
        >
          <i class="i-lucide-square-pen size-3.5"></i> Edit
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
          @click="handleDelete"
        >
          <i class="i-lucide-trash-2 size-3.5"></i> Delete
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { formatDateTime } from '@/utils/date';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { useCourseDelete } from '@/features/course/hooks/useCourseDelete';
import { useTemplateRef } from 'vue';
import { useElementInView } from '@/hooks/useElementInView';
import type { Course } from '@tutorhub/database';

const props = defineProps<{
  course: Course;
}>();

const router = useRouter();
const { confirmAndDelete } = useCourseDelete();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isVisible } = useElementInView(cardRef);

async function handleDelete() {
  try {
    await confirmAndDelete({ id: props.course.id, name: props.course.name });
  } catch {
    // User cancelled or delete failed
  }
}
</script>
