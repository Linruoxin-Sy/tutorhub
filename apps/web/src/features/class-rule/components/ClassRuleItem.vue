<template>
  <article
    ref="itemRef"
    class="relative flex origin-bottom-right cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-lg dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-32 scale-80 opacity-0'"
    @click="!effectiveLoading && emit('view')"
  >
    <!-- ===== Loading skeleton (card shape) ===== -->
    <div v-if="effectiveLoading" class="flex flex-col">
      <div class="bg-linear-to-r from-teal-500 to-emerald-600 px-5 py-4">
        <div class="h-5 w-56 animate-pulse rounded bg-white/30" />
        <div class="mt-2 h-4 w-40 animate-pulse rounded bg-white/20" />
      </div>
      <div class="flex flex-1 items-center gap-4 px-5 py-5">
        <div class="flex flex-1 flex-col gap-3">
          <div class="h-8 w-36 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
          <div class="h-4 w-44 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div class="flex shrink-0 gap-2">
          <div class="h-8 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
          <div class="h-8 w-18 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
        </div>
      </div>
    </div>

    <!-- ===== 真实内容 ===== -->
    <template v-else>
      <!-- 头部：日期区间 + 操作按钮 -->
      <div class="bg-linear-to-r from-teal-500 to-emerald-600 px-5 py-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-white/90">
              <i class="i-lucide-calendar size-4 shrink-0" />
              <span class="text-base font-bold text-white">
                {{ formatDate(rule!.startDate) }}
              </span>
              <i v-if="rule!.endDate" class="i-lucide-arrow-right size-4 text-white/60" />
              <span v-if="rule!.endDate" class="text-base font-bold text-white">
                {{ formatDate(rule!.endDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主体：时间展示 + 操作按钮 -->
      <div class="flex flex-1 items-center gap-4 px-5 py-5">
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/10"
        >
          <i class="i-lucide-clock size-6 text-teal-600 dark:text-teal-400" />
        </div>
        <div class="flex min-w-0 flex-1 flex-wrap items-baseline gap-3">
          <span class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ formatTime(rule!.startTime) }}
          </span>
          <i class="i-lucide-arrow-right size-5 shrink-0 text-gray-400 dark:text-gray-500" />
          <span class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ formatTime(rule!.endTime) }}
          </span>
          <i
            class="i-mdi-circle size-2 shrink-0 self-center px-2 text-gray-400 dark:text-gray-500"
          />
          <span
            class="self-center text-xl font-bold tracking-tight text-gray-500 dark:text-gray-400"
          >
            <template v-if="rule!.intervalDays"> Every {{ rule!.intervalDays }} day(s) </template>
            <template v-else>Single session</template>
          </span>
        </div>
        <div v-if="actions.length" class="flex shrink-0 gap-1 self-end">
          <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
          <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
        </div>
      </div>
    </template>
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
