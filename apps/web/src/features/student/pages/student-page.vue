<template>
  <main class="h-full mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="h-full flex flex-col gap-6">
      <StudentList />
    </div>
  </main>
</template>

<script setup lang="ts">
import StudentList from '@/features/student/components/StudentList.vue';
</script>
