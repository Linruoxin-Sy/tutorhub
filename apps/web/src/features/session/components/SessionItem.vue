<template>
  <article
    class="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="{ 'border-amber-300 dark:border-amber-700': conflict }"
  >
    <!-- 日期/时间图标 -->
    <div
      class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#2c2c2c]"
    >
      <i class="i-lucide-calendar-days size-6 text-gray-500 dark:text-gray-400" />
    </div>

    <!-- 主信息 -->
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <span>{{ studentName }}</span>
        <i class="i-lucide-arrow-right size-3 shrink-0 text-gray-400 dark:text-gray-500" />
        <span class="font-medium text-gray-500 dark:text-gray-400">{{ courseName }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span class="text-gray-700 dark:text-gray-300">
          <i class="i-lucide-calendar inline size-3.5 align-text-top" />
          {{ date }}
        </span>
        <span class="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <i class="i-lucide-clock inline size-3.5 align-text-top" />
          {{ startTime }}
          <i class="i-lucide-arrow-right inline size-3.5 text-gray-400 dark:text-gray-500" />
          {{ endTime }}
        </span>
        <!-- 调课变更标记 -->
        <span
          v-if="overriddenStartTime || overriddenEndTime"
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <i class="i-lucide-rotate-ccw size-3" />
          Rescheduled
        </span>
      </div>
      <!-- 调课详情 -->
      <div
        v-if="overriddenStartTime || overriddenEndTime"
        class="mt-1 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400"
      >
        <span class="text-gray-400 line-through dark:text-gray-500">
          {{ startTime }} – {{ endTime }}
        </span>
        <i class="i-lucide-arrow-right size-3 shrink-0" />
        <span class="font-medium">
          {{ overriddenStartTime || startTime }} – {{ overriddenEndTime || endTime }}
        </span>
      </div>
    </div>

    <!-- 冲突标记 -->
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
withDefaults(
  defineProps<{
    studentName: string;
    courseName: string;
    date: string;
    startTime: string;
    endTime: string;
    overriddenStartTime?: string | null;
    overriddenEndTime?: string | null;
    actions?: ('change' | 'edit')[];
    conflict?: boolean;
  }>(),
  {
    actions: () => [],
    conflict: false,
    overriddenStartTime: null,
    overriddenEndTime: null,
  },
);

const emit = defineEmits<{
  change: [];
  edit: [];
}>();
</script>
