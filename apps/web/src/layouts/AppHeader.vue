<template>
  <div class="flex h-full items-center justify-between bg-white px-4 dark:bg-[#2c2c2c]">
    <div class="">
      <div class="text-2xl font-bold text-gray-800 dark:text-white">TutorHub</div>
    </div>
    <div class="">
      <AppNavBar />
    </div>
    <div class="flex items-center gap-4">
      <ThemeToggler />
      <AppAvatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppAvatar from '@/layouts/AppAvatar.vue';
import AppNavBar from '@/layouts/AppNavBar.vue';
import ThemeToggler from '@/layouts/ThemeToggler.vue';
</script>
