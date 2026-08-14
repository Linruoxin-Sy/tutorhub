<template>
  <nav
    class="hidden items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm lg:inline-flex dark:border-[#2f2f2f] dark:bg-[#202020]"
    :aria-label="t('layouts.nav.ariaLabel')"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.labelKey"
      :to="{ name: item.routeName }"
      class="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
      :class="isNavActive(item.routeName, route.name) ? activeClass : inactiveClass"
    >
      <i :class="item.icon"></i>
      <span>{{ t(item.labelKey) }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { isNavActive, navItems } from '@/layouts/nav-items';

const { t } = useI18n();

const route = useRoute();

const activeClass =
  'bg-white text-gray-900 shadow-sm ring-1 ring-black/5 dark:bg-[#2e2e2e] dark:text-white dark:ring-white/10';
const inactiveClass =
  'text-gray-500 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white';
</script>
