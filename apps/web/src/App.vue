<template>
  <AppLayout>
    <RouterView v-slot="{ Component, route: slotRoute }">
      <Transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="slotRoute.path" />
      </Transition>
    </RouterView>
  </AppLayout>
  <ConfirmDialog />
  <Toaster rich-colors position="bottom-right" :visible-toasts="6" :theme="theme" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { usePageTransition } from '@/hooks/usePageTransition';
import AppLayout from '@/layouts/AppLayout.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';

const { theme } = useThemeToggle();
const route = useRoute();
const { transitionName } = usePageTransition(route);
</script>
