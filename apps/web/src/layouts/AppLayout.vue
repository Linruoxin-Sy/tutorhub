<template>
  <div class="flex h-screen flex-col bg-gray-100 text-gray-900 dark:bg-[#1b1b1b] dark:text-white">
    <div v-if="!route.meta.hideAppHeader" class="h-20 shrink-0">
      <AppHeader />
    </div>
    <div class="flex-1 overflow-x-hidden overflow-y-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/layouts/AppHeader.vue';
const route = useRoute();
</script>
