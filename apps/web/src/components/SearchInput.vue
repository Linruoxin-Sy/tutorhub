<template>
  <div :class="size === 'sm' ? 'sm:max-w-xs sm:min-w-80' : ''">
    <label class="relative block">
      <i
        class="i-lucide-search absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
      ></i>
      <input
        v-model="model"
        type="text"
        :placeholder="placeholder"
        class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
const { placeholder = 'Search...', size = 'sm' } = defineProps<{
  placeholder?: string;
  size?: 'sm' | 'md';
}>();

const model = defineModel<string>({ required: true });
</script>
