<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <ControlsSection />
      <TableSection />
    </div>
  </main>
</template>

<script setup lang="ts">
import ControlsSection from '@/features/student/components/ControlsSection.vue';
import TableSection from '@/features/student/components/TableSection.vue';
</script>
