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
import { computed } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useThemeToggle } from '@/hooks/useThemeToggle';
import { usePageTransition } from '@/hooks/usePageTransition';
import AppLayout from '@/layouts/AppLayout.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';

const { width } = useWindowSize();
const slideDistance = computed(() => `${Math.max(200, (width.value / 3) * 2)}px`);

const { theme } = useThemeToggle();
const { transitionName } = usePageTransition();
</script>

<style scoped>
/* ── Navbar ↔ Navbar: 左右滑动 ── */
.slide-left-leave-active,
.slide-left-enter-active,
.slide-right-leave-active,
.slide-right-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from {
  transform: translateX(v-bind(slideDistance));
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(calc(v-bind(slideDistance) * -1));
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(calc(v-bind(slideDistance) * -1));
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(v-bind(slideDistance));
  opacity: 0;
}

/* ── 其余所有场景: 中心缩放淡入淡出 ── */
.fade-scale-leave-active,
.fade-scale-enter-active {
  transition: all 0.2s ease;
}
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
