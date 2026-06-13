<template>
  <article
    ref="cardRef"
    class="flex h-36 origin-bottom-right cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-lg dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-32 scale-80 opacity-0'"
    @click="goToDetail"
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
      <div class="flex shrink-0 gap-2 self-end">
        <EditButton @click.stop="router.push({ name: 'course.edit', params: { id: course.id } })" />
        <DeleteButton @click.stop="handleDelete" />
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

function goToDetail() {
  router.push({ name: 'course.detail', params: { id: props.course.id } });
}

async function handleDelete() {
  try {
    await confirmAndDelete({ id: props.course.id, name: props.course.name });
  } catch {
    // User cancelled or delete failed
  }
}
</script>
