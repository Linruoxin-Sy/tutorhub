<template>
  <select
    v-model="model"
    :class="[
      'select w-full cursor-pointer rounded-xl border border-gray-200 bg-white text-sm text-gray-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white',
      size === 'sm' ? 'py-2.5' : 'px-4 py-3',
    ]"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
const { size = 'sm' } = defineProps<{
  size?: 'sm' | 'md';
}>();

const model = defineModel<string>({ required: true });
</script>
