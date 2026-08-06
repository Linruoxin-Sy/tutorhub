<template>
  <div
    class="flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-[#202020]"
    role="group"
    :aria-label="t('layouts.locale.ariaLabel')"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="flex size-8 cursor-pointer items-center justify-center rounded-full text-xs font-semibold transition"
      :class="
        locale === option.value
          ? 'bg-white text-gray-900 shadow-sm dark:bg-[#3a3a3a] dark:text-white'
          : 'text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-[#3a3a3a]'
      "
      :aria-label="option.label"
      :aria-pressed="locale === option.value"
      @click="setLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useLocaleToggle } from '@/hooks/useLocaleToggle';
import type { AppLocale } from '@/locales';

const { t } = useI18n();
const { locale, setLocale } = useLocaleToggle();

const options = computed<Array<{ value: AppLocale; label: string }>>(() => [
  { value: 'en', label: t('layouts.locale.en') },
  { value: 'zh-CN', label: t('layouts.locale.zhCn') },
]);
</script>
