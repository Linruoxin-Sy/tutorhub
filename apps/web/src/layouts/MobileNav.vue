<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
        @click="close()"
      ></div>
    </Transition>

    <Transition name="drawer-slide">
      <aside
        v-if="open"
        id="mobile-nav-drawer"
        class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl dark:bg-[#202020]"
        role="dialog"
        aria-modal="true"
        :aria-label="t('layouts.nav.drawerLabel')"
      >
        <div class="flex shrink-0 items-center justify-between px-5 py-4">
          <div class="text-2xl font-bold text-gray-800 dark:text-white">TutorHub</div>
          <button
            type="button"
            class="flex size-9 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
            :aria-label="t('layouts.nav.closeMenu')"
            @click="close()"
          >
            <i class="i-lucide-x"></i>
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 py-2" :aria-label="t('layouts.nav.ariaLabel')">
          <RouterLink
            v-for="item in navItems"
            :key="item.labelKey"
            :to="{ name: item.routeName }"
            class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
            :class="isNavActive(item.routeName, route.name) ? activeClass : inactiveClass"
            @click="close()"
          >
            <i :class="item.icon"></i>
            <span>{{ t(item.labelKey) }}</span>
          </RouterLink>
        </nav>

        <div
          class="flex shrink-0 items-center justify-center gap-4 border-t border-gray-200 px-5 py-4 dark:border-[#2f2f2f]"
        >
          <LocaleToggler />
          <ThemeToggler />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollLock } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import { isNavActive, navItems } from '@/layouts/nav-items';
import LocaleToggler from '@/layouts/LocaleToggler.vue';
import ThemeToggler from '@/layouts/ThemeToggler.vue';

const { t } = useI18n();

const route = useRoute();

const open = defineModel<boolean>('open', { default: false });

const isLocked = useScrollLock(document.body);

function close() {
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});

// 打开时锁定背景滚动
watch(open, (value) => {
  isLocked.value = value;
});

// 路由切换时自动关闭抽屉
watch(
  () => route.name,
  () => {
    if (open.value) close();
  },
);

const activeClass =
  'bg-white text-gray-900 shadow-sm ring-1 ring-black/5 dark:bg-[#2e2e2e] dark:text-white dark:ring-white/10';
const inactiveClass =
  'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white';
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}
</style>
