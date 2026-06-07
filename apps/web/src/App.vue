<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <ConfirmDialog />
  <Toaster rich-colors position="bottom-right" :visible-toasts="6" :theme="theme" />
</template>

<script setup lang="ts">
import { useThemeToggle } from '@/hooks/useThemeToggle';
import AppLayout from '@/layouts/AppLayout.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
const { theme } = useThemeToggle();
</script>
