<template>
  <article
    ref="itemRef"
    class="relative flex h-36 origin-bottom-right cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-lg dark:border-[#2f2f2f] dark:bg-[#202020]"
    :class="[
      isVisible ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-32 scale-80 opacity-0',
      !effectiveLoading && selected
        ? 'shadow-[0_0_20px_-4px] ring-3 shadow-blue-500/40 ring-blue-500/50'
        : '',
    ]"
    @click="!effectiveLoading && emit('view')"
  >
    <!-- 选中蒙层（仅真实内容） -->
    <div
      v-if="!effectiveLoading && selected"
      class="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-blue-500/15"
    />

    <!-- ===== 标题区域 ===== -->
    <Transition name="fade" mode="out-in">
      <div
        v-if="effectiveLoading"
        key="sk-header"
        class="bg-linear-to-r from-blue-500 to-indigo-600 px-5 py-4"
      >
        <div class="h-5 w-48 animate-pulse rounded bg-white/30" />
      </div>
      <div
        v-else
        key="ct-header"
        class="px-5 py-4"
        :style="{ background: getAvatarGradient(course!.name) }"
      >
        <div class="flex items-start justify-between gap-4">
          <h3 class="text-lg font-bold" :style="{ color: getAvatarTextColor(course!.name) }">
            {{ course!.name }}
          </h3>
          <span
            class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold"
            :style="{ color: getAvatarTextColor(course!.name) }"
          >
            {{ course!.status }}
          </span>
        </div>
      </div>
    </Transition>

    <!-- ===== 主体区域 ===== -->
    <div class="flex flex-1 items-start justify-between gap-4 px-5 py-4">
      <div class="min-w-0 flex-1 space-y-2">
        <!-- 描述 -->
        <Transition name="scale-fade" mode="out-in">
          <div v-if="effectiveLoading" key="sk-desc">
            <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <p
            v-else
            key="ct-desc"
            class="truncate text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          >
            {{ course!.description || 'No description provided.' }}
          </p>
        </Transition>

        <!-- 创建时间 -->
        <Transition name="scale-fade" mode="out-in">
          <div v-if="effectiveLoading" key="sk-date">
            <div class="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-[#343434]" />
          </div>
          <span v-else key="ct-date" class="block text-xs text-gray-500 dark:text-gray-400">
            Created {{ formatDateTime(course!.createdAt) }}
          </span>
        </Transition>
      </div>

      <!-- 操作按钮 -->
      <Transition name="scale-fade" mode="out-in">
        <div v-if="effectiveLoading" key="sk-actions" class="flex shrink-0 gap-2 self-end">
          <div class="h-8 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
          <div class="h-8 w-18 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div v-else-if="actions.length" key="ct-actions" class="flex shrink-0 gap-2 self-end">
          <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
          <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
        </div>
      </Transition>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/date';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { useTemplateRef, computed } from 'vue';
import { useElementInView } from '@/hooks/useElementInView';
import type { Course } from '@tutorhub/database';

const props = withDefaults(
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
/** 数据未就绪或尚未进入视口时均显示 skeleton */
const effectiveLoading = computed(() => props.loading || !isVisible.value);
</script>

<style scoped>
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
