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
    @click="!effectiveLoading && emit('view')"
  >
    <!-- 选中指示器（仅真实内容） -->
    <div
      v-if="!effectiveLoading && selected"
      class="pointer-events-none absolute top-0 left-0 h-full w-1 rounded-r-sm bg-blue-500"
    />

    <!-- ===== 列 1：头像 + 姓名 ===== -->
    <div class="flex items-center gap-3 px-6 whitespace-nowrap">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-100"
        leave-active-class="transition duration-100"
        enter-from-class="opacity-0 scale-[0.85]"
        leave-to-class="opacity-0 scale-[0.85]"
      >
        <div v-if="effectiveLoading" key="sk-name" class="flex items-center gap-3">
          <div class="size-9 shrink-0 rounded-full bg-gray-200 dark:bg-[#343434]" />
          <div class="h-4 w-32 rounded bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div v-else key="ct-name" class="flex min-w-0 items-center gap-3">
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
      </Transition>
    </div>

    <!-- ===== 列 2：邮箱 ===== -->
    <div class="px-6">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-100"
        leave-active-class="transition duration-100"
        enter-from-class="opacity-0 scale-[0.85]"
        leave-to-class="opacity-0 scale-[0.85]"
      >
        <div v-if="effectiveLoading" key="sk-email">
          <div class="h-4 w-24 rounded bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div
          v-else
          key="ct-email"
          class="truncate text-sm whitespace-nowrap text-gray-600 dark:text-gray-300"
        >
          {{ student!.email || '-' }}
        </div>
      </Transition>
    </div>

    <!-- ===== 列 3：电话 ===== -->
    <div class="px-6">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-100"
        leave-active-class="transition duration-100"
        enter-from-class="opacity-0 scale-[0.85]"
        leave-to-class="opacity-0 scale-[0.85]"
      >
        <div v-if="effectiveLoading" key="sk-phone">
          <div class="h-4 w-24 rounded bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div
          v-else
          key="ct-phone"
          class="truncate text-sm whitespace-nowrap text-gray-600 dark:text-gray-300"
        >
          {{ student!.phone || '-' }}
        </div>
      </Transition>
    </div>

    <!-- ===== 列 4：创建时间 ===== -->
    <div class="px-6">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-100"
        leave-active-class="transition duration-100"
        enter-from-class="opacity-0 scale-[0.85]"
        leave-to-class="opacity-0 scale-[0.85]"
      >
        <div v-if="effectiveLoading" key="sk-date">
          <div class="h-4 w-32 rounded bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div
          v-else
          key="ct-date"
          class="truncate text-sm whitespace-nowrap text-gray-600 dark:text-gray-300"
        >
          {{ formatDateTime(student!.createdAt) }}
        </div>
      </Transition>
    </div>

    <!-- ===== 列 5：操作按钮 ===== -->
    <div class="flex items-center justify-end gap-1 px-6">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-100"
        leave-active-class="transition duration-100"
        enter-from-class="opacity-0 scale-[0.85]"
        leave-to-class="opacity-0 scale-[0.85]"
      >
        <div v-if="effectiveLoading" key="sk-actions" class="flex items-center gap-1">
          <div class="size-8 rounded-lg bg-gray-200 dark:bg-[#343434]" />
          <div class="size-8 rounded-lg bg-gray-200 dark:bg-[#343434]" />
        </div>
        <div v-else key="ct-actions" class="flex items-center gap-1">
          <template v-if="actions.length">
            <EditButton v-if="actions.includes('edit')" @click.stop="emit('edit')" />
            <DeleteButton v-if="actions.includes('delete')" @click.stop="emit('delete')" />
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, computed } from 'vue';
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
/** 数据未就绪或尚未进入视口时均显示 skeleton */
const effectiveLoading = computed(() => props.loading || !isVisible.value);
</script>
