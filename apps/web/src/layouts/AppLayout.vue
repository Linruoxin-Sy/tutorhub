<template>
  <div class="h-screen bg-gray-100 dark:bg-[#1b1b1b] text-gray-900 dark:text-white flex flex-col">
    <div class="h-20 shrink-0">
      <AppHeader />
    </div>
    <div class="flex-1 overflow-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/layouts/AppHeader.vue';
</script>
