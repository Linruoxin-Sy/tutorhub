<template>
  <button
    type="button"
    :class="[
      'inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses,
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  }>(),
  { disabled: false, variant: 'primary' },
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#3a3a3a] dark:bg-transparent dark:text-gray-300 dark:hover:bg-[#202020]';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700';
  }
});
</script>
