<template>
  <div class="flex items-center justify-center py-10">
    <i class="i-lucide-loader-circle size-6 animate-spin text-gray-400"></i>
    <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>
