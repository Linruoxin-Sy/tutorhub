<template>
  <div class="flex h-full items-center justify-between bg-white px-4 dark:bg-[#2c2c2c]">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex size-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-200 lg:hidden dark:text-gray-300 dark:hover:bg-[#3a3a3a]"
        :aria-label="t('layouts.nav.openMenu')"
        aria-haspopup="dialog"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-nav-drawer"
        @click="isMenuOpen = !isMenuOpen"
      >
        <i class="i-lucide-menu"></i>
      </button>
      <div class="text-2xl font-bold text-gray-800 dark:text-white">TutorHub</div>
    </div>

    <AppNavBar />

    <div class="flex items-center gap-4">
      <div class="hidden items-center gap-4 lg:flex">
        <LocaleToggler />
        <ThemeToggler />
      </div>
      <AppAvatar />
    </div>

    <MobileNav v-model:open="isMenuOpen" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import AppAvatar from '@/layouts/AppAvatar.vue';
import AppNavBar from '@/layouts/AppNavBar.vue';
import LocaleToggler from '@/layouts/LocaleToggler.vue';
import MobileNav from '@/layouts/MobileNav.vue';
import ThemeToggler from '@/layouts/ThemeToggler.vue';

const { t } = useI18n();

const isMenuOpen = ref(false);
</script>
