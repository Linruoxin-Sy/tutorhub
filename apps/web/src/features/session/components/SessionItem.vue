<template>
  <article
    class="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="{
      'border-amber-300 dark:border-amber-700': conflict,
      'opacity-60': status === 'cancelled',
    }"
  >
    <!-- 日期/时间图标 -->
    <div
      class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#2c2c2c]"
      :class="{
        'bg-red-100 dark:bg-red-900/20': status === 'cancelled',
        'bg-green-100 dark:bg-green-900/20': status === 'ongoing',
      }"
    >
      <template v-if="status === 'cancelled'">
        <i class="i-lucide-x-circle size-6 text-red-500 dark:text-red-400" />
      </template>
      <template v-else-if="status === 'ongoing'">
        <i class="i-lucide-play-circle size-6 text-green-600 dark:text-green-400" />
      </template>
      <template v-else-if="status === 'completed'">
        <i class="i-lucide-check-circle size-6 text-gray-400 dark:text-gray-500" />
      </template>
      <template v-else>
        <i class="i-lucide-calendar-days size-6 text-gray-500 dark:text-gray-400" />
      </template>
    </div>

    <!-- 主信息 - 非调课状态 -->
    <div v-if="status !== 'rescheduled'" class="flex min-w-0 flex-1 flex-col gap-1">
      <div
        class="text-sm font-semibold"
        :class="{
          'text-gray-400 line-through dark:text-gray-500': status === 'cancelled',
          'text-gray-900 dark:text-white': status !== 'cancelled',
        }"
      >
        {{ courseName }}
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span
          :class="{
            'text-gray-400 line-through dark:text-gray-500': status === 'cancelled',
            'text-gray-700 dark:text-gray-300': status !== 'cancelled',
          }"
        >
          <i class="i-lucide-calendar inline size-3.5 align-text-top" />
          {{ date }}
        </span>
        <span
          class="inline-flex items-center gap-1"
          :class="{
            'text-gray-400 line-through dark:text-gray-500': status === 'cancelled',
            'text-gray-500 dark:text-gray-400': status !== 'cancelled',
          }"
        >
          <i class="i-lucide-clock inline size-3.5 align-text-top" />
          {{ startTime }}
          <i class="i-lucide-arrow-right inline size-3.5 text-gray-400 dark:text-gray-500" />
          {{ endTime }}
        </span>

        <!-- Cancelled 标记 -->
        <span
          v-if="status === 'cancelled'"
          class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400"
        >
          <i class="i-lucide-x-circle size-3" />
          Cancelled
        </span>

        <!-- Ongoing 标记 -->
        <span
          v-if="status === 'ongoing'"
          class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
        >
          <i class="i-lucide-play size-3" />
          Ongoing
        </span>

        <!-- Completed 标记 -->
        <span
          v-if="status === 'completed'"
          class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-[#2c2c2c] dark:text-gray-400"
        >
          <i class="i-lucide-check-circle size-3" />
          Completed
        </span>
      </div>
    </div>

    <!-- 主信息 - 调课状态（横向布局：原 → 新） -->
    <div v-else class="flex min-w-0 flex-1 items-center gap-4">
      <!-- 原时间（删除线） -->
      <div class="flex flex-1 flex-col gap-1">
        <div class="text-sm font-semibold text-gray-400 line-through dark:text-gray-500">
          {{ courseName }}
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span class="text-gray-400 line-through dark:text-gray-500">
            <i class="i-lucide-calendar inline size-3.5 align-text-top" />
            {{ overriddenDate || date }}
          </span>
          <span class="inline-flex items-center gap-1 text-gray-400 line-through dark:text-gray-500">
            <i class="i-lucide-clock inline size-3.5 align-text-top" />
            {{ startTime }}
            <i class="i-lucide-arrow-right inline size-3.5" />
            {{ endTime }}
          </span>
        </div>
      </div>

      <!-- 箭头 + 标记 -->
      <div class="flex shrink-0 flex-col items-center gap-1">
        <i class="i-lucide-arrow-right size-5 text-amber-500 dark:text-amber-400" />
        <span
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <i class="i-lucide-rotate-ccw size-3" />
          Rescheduled
        </span>
      </div>

      <!-- 新时间 -->
      <div class="flex flex-1 flex-col gap-1">
        <div class="text-sm font-semibold text-amber-700 dark:text-amber-400">
          {{ courseName }}
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span class="text-amber-700 dark:text-amber-400">
            <i class="i-lucide-calendar inline size-3.5 align-text-top" />
            {{ date }}
          </span>
          <span class="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <i class="i-lucide-clock inline size-3.5 align-text-top" />
            {{ overriddenStartTime || startTime }}
            <i class="i-lucide-arrow-right inline size-3.5" />
            {{ overriddenEndTime || endTime }}
          </span>
        </div>
      </div>
    </div>

    <!-- 冲突标记（独立于 status） -->
    <div
      v-if="conflict"
      class="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400"
    >
      <i class="i-lucide-alert-triangle size-3" />
      Conflict
    </div>

    <!-- Actions -->
    <div v-if="actions.includes('change')" class="flex shrink-0 gap-1">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#2c2c2c]"
        @click.stop="emit('change')"
      >
        <i class="i-lucide-rotate-ccw size-3.5" />
        Change
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SessionStatus } from '@tutorhub/schema';

withDefaults(
  defineProps<{
    courseName: string;
    date: string;
    startTime: string;
    endTime: string;
    status?: SessionStatus;
    overriddenDate?: string | null;
    overriddenStartTime?: string | null;
    overriddenEndTime?: string | null;
    actions?: ('change' | 'edit')[];
    conflict?: boolean;
  }>(),
  {
    status: 'default',
    actions: () => [],
    conflict: false,
    overriddenDate: null,
    overriddenStartTime: null,
    overriddenEndTime: null,
  },
);

const emit = defineEmits<{
  change: [];
  edit: [];
}>();
</script>
