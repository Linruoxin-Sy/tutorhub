<template>
  <div class="h-screen bg-gray-100 dark:bg-[#1b1b1b] text-gray-900 dark:text-white flex flex-col">
    <AppHeader />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/ui/AppHeader.vue';
</script>
