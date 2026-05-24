<template>
  <div class="flex justify-between items-center h-full px-4 bg-white dark:bg-[#2c2c2c]">
    <div class="">
      <div class="text-2xl font-bold text-gray-800 dark:text-white">TutorHub</div>
    </div>
    <div class="flex items-center gap-4">
      <ThemeToggler />
      <AppAvatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppAvatar from '@/ui/AppAvatar.vue';
import ThemeToggler from '@/ui/ThemeToggler.vue';
</script>
