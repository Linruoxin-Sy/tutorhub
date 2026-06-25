<template>
  <div class="flex h-screen flex-col bg-gray-100 text-gray-900 dark:bg-[#1b1b1b] dark:text-white">
    <Transition
      enter-active-class="transition-all duration-[250]"
      leave-active-class="transition-all duration-[250]"
      enter-from-class="opacity-0 -translate-y-full [height:0!important]"
      leave-to-class="opacity-0 -translate-y-full [height:0!important]"
    >
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
