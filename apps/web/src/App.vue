<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/ui/AppLayout.vue';
import { RouterView } from 'vue-router';
</script>
