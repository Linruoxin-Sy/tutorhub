<template>
  <article
    class="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="display.cardClass"
    @click="emit('view')"
  >
    <!-- 日期/时间图标 -->
    <div
      class="flex size-12 shrink-0 items-center justify-center rounded-xl"
      :class="display.iconContainerClass"
    >
      <i :class="display.iconClass" />
    </div>

    <!-- 主信息 - 非调课状态 -->
    <div v-if="display.mode === 'normal'" class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="text-sm font-semibold" :class="display.normalTitleClass">
        {{ display.courseName }}
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span :class="display.normalDateClass">
          <i class="i-lucide-calendar inline size-3.5 align-text-top" />
          {{ display.normalDate }}
        </span>
        <span class="inline-flex items-center gap-1" :class="display.normalTimeClass">
          <i class="i-lucide-clock inline size-3.5 align-text-top" />
          {{ display.normalStartTime }}
          <i class="i-lucide-arrow-right inline size-3.5 text-gray-400 dark:text-gray-500" />
          {{ display.normalEndTime }}
        </span>

        <span
          v-for="badge in display.normalBadges"
          :key="badge.key"
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          :class="badge.class"
        >
          <i :class="badge.icon" />
          {{ badge.label }}
        </span>

        <span
          v-if="price != null"
          class="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          <i class="i-lucide-coins inline size-3.5 align-text-top" />
          ¥{{ Number(price).toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- 主信息 - 调课状态（横向布局：原 → 新） -->
    <div v-else class="flex min-w-0 flex-1 items-center gap-4">
      <!-- 原时间（删除线） -->
      <div class="flex flex-1 flex-col gap-1">
        <div class="text-sm font-semibold" :class="display.originalTitleClass">
          {{ display.courseName }}
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span :class="display.originalDateClass">
            <i class="i-lucide-calendar inline size-3.5 align-text-top" />
            {{ display.originalDate }}
          </span>
          <span class="inline-flex items-center gap-1" :class="display.originalTimeClass">
            <i class="i-lucide-clock inline size-3.5 align-text-top" />
            {{ display.originalStartTime }}
            <i class="i-lucide-arrow-right inline size-3.5" />
            {{ display.originalEndTime }}
          </span>

          <span
            v-if="originalPrice != null"
            class="inline-flex items-center gap-1 text-sm font-semibold"
            :class="display.originalTimeClass"
          >
            <i class="i-lucide-coins inline size-3.5 align-text-top" />
            ¥{{ Number(originalPrice).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- 箭头 + 标记 -->
      <div class="flex shrink-0 flex-col items-center gap-1">
        <i class="i-lucide-arrow-right size-5 text-amber-500 dark:text-amber-400" />
        <div class="flex items-center gap-1">
          <span
            v-for="badge in display.rescheduledBadges"
            :key="badge.key"
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            :class="badge.class"
          >
            <i :class="badge.icon" />
            {{ badge.label }}
          </span>
        </div>
      </div>

      <!-- 新时间 -->
      <div class="flex flex-1 flex-col gap-1">
        <div class="text-sm font-semibold" :class="display.newTitleClass">
          {{ display.courseName }}
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span :class="display.newDateClass">
            <i class="i-lucide-calendar inline size-3.5 align-text-top" />
            {{ display.newDate }}
          </span>
          <span class="inline-flex items-center gap-1" :class="display.newTimeClass">
            <i class="i-lucide-clock inline size-3.5 align-text-top" />
            {{ display.newStartTime }}
            <i class="i-lucide-arrow-right inline size-3.5" />
            {{ display.newEndTime }}
          </span>

          <span
            v-if="price != null"
            class="inline-flex items-center gap-1 text-sm font-semibold"
            :class="display.newTimeClass"
          >
            <i class="i-lucide-coins inline size-3.5 align-text-top" />
            ¥{{ Number(price).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 冲突标记（独立于 status） -->
    <div
      v-if="display.showConflictBadge"
      class="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400"
    >
      <i class="i-lucide-alert-triangle size-3" />
      Conflict
    </div>

    <!-- Actions -->
    <div v-if="display.showActions" class="flex shrink-0 gap-1">
      <button
        v-if="display.visibleActions.includes('change')"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#2c2c2c]"
        @click.stop="emit('change')"
      >
        <i class="i-lucide-rotate-ccw size-3.5" />
        Change
      </button>
      <button
        v-if="display.visibleActions.includes('edit')"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-400 dark:hover:bg-[#2c2c2c]"
        @click.stop="emit('edit')"
      >
        <i class="i-lucide-pencil size-3.5" />
        Edit
      </button>
      <button
        v-if="display.visibleActions.includes('restore')"
        type="button"
        class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
        @click.stop="emit('restore')"
      >
        <i class="i-lucide-rotate-ccw size-3.5" />
        Restore
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useSessionDisplay } from '@/features/session/composables/useSessionDisplay';
import type { SessionStatus } from '@tutorhub/schema';

const props = withDefaults(
  defineProps<{
    courseName: string;
    date: string;
    startTime: string;
    endTime: string;
    status?: SessionStatus;
    /** 调课前的原始日期（仅 rescheduled 模式使用） */
    originalDate?: string | null;
    /** 调课前的原始开始时间（仅 rescheduled 模式使用） */
    originalStartTime?: string | null;
    /** 调课前的原始结束时间（仅 rescheduled 模式使用） */
    originalEndTime?: string | null;
    actions?: ('change' | 'edit' | 'restore')[];
    conflict?: boolean;
    /** 该次 session 的价格 */
    price?: number | null;
    /** 修改前原始价格（调课时展示左侧划掉的价格） */
    originalPrice?: number | null;
  }>(),
  {
    status: 'default',
    actions: () => [],
    conflict: false,
    originalDate: null,
    originalStartTime: null,
    originalEndTime: null,
    price: null,
    originalPrice: null,
  },
);

const emit = defineEmits<{
  change: [];
  edit: [];
  restore: [];
  view: [];
}>();

const { display } = useSessionDisplay({
  courseName: props.courseName,
  date: props.date,
  startTime: props.startTime,
  endTime: props.endTime,
  status: props.status,
  originalDate: props.originalDate,
  originalStartTime: props.originalStartTime,
  originalEndTime: props.originalEndTime,
  actions: props.actions,
  conflict: props.conflict,
});
</script>
