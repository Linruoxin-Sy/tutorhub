<template>
  <article
    ref="itemRef"
    class="relative origin-bottom-right cursor-pointer transition-all duration-700"
    :class="isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-16 scale-80 opacity-0'"
    @click="!effectiveLoading && emit('view')"
  >
    <!-- Loading skeleton -->
    <div v-if="effectiveLoading" class="flex items-center gap-4 px-6 py-4">
      <div class="flex flex-1 flex-col gap-2">
        <div class="h-5 w-48 rounded bg-gray-200 dark:bg-[#343434]" />
        <div class="h-4 w-64 rounded bg-gray-200 dark:bg-[#343434]" />
      </div>
    </div>

    <!-- Real content -->
    <div v-else class="border-b border-gray-200 px-6 py-4 dark:border-[#343434]">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1 space-y-2">
          <!-- 日期范围 -->
          <div class="flex items-center gap-2">
            <i class="i-lucide-calendar size-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatDate(rule!.startDate) }}
            </span>
            <span v-if="rule!.endDate" class="text-sm text-gray-500 dark:text-gray-400">→</span>
            <span v-if="rule!.endDate" class="text-sm text-gray-900 dark:text-white">
              {{ formatDate(rule!.endDate) }}
            </span>
          </div>

          <!-- 时间范围 -->
          <div class="flex items-center gap-2">
            <i class="i-lucide-clock size-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatTime(rule!.startTime) }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">→</span>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ formatTime(rule!.endTime) }}
            </span>
          </div>

          <!-- 间隔/循环 -->
          <div class="flex items-center gap-2">
            <i class="i-lucide-repeat-2 size-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              <template v-if="rule!.intervalDays"> Every {{ rule!.intervalDays }} day(s) </template>
              <template v-else>Single session</template>
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="actions.length" class="flex shrink-0 gap-1 self-start">
          <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
          <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useTemplateRef, computed } from 'vue';
import type { ClassRule } from '@tutorhub/database';
import { formatDate, formatTime } from '@/utils/date';
import { useElementInView } from '@/hooks/useElementInView';

const props = withDefaults(
  defineProps<{
    rule?: ClassRule;
    actions?: ('edit' | 'delete')[];
    loading?: boolean;
  }>(),
  {
    rule: undefined,
    actions: () => ['edit', 'delete'],
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
const effectiveLoading = computed(() => props.loading || !isVisible.value);
</script>
