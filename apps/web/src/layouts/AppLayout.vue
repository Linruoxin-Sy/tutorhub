<template>
  <div class="flex h-screen flex-col bg-gray-100 text-gray-900 dark:bg-[#1b1b1b] dark:text-white">
    <Transition name="header-slide">
      <div v-if="!route.meta.hideAppHeader" class="shrink-0" style="height: 80px">
        <AppHeader />
      </div>
    </Transition>
    <div class="flex-1 overflow-x-hidden overflow-y-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/layouts/AppHeader.vue';
const route = useRoute();
</script>

<style>
.header-slide-enter-active,
.header-slide-leave-active {
  transition: all 0.25s ease;
}
.header-slide-enter-from,
.header-slide-leave-to {
  height: 0 !important;
  opacity: 0;
  transform: translateY(-100%);
}
</style>
