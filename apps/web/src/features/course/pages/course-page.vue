<template>
  <main class="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="flex h-full flex-col gap-6">
      <Courses />
    </div>
  </main>
</template>

<script setup lang="ts">
import Courses from '@/features/course/components/Courses.vue';
</script>
