import { useLocalStorage } from '@vueuse/core';

import { LOCALE_STORAGE_KEY, type AppLocale } from '@/locales';
import { applyLocale } from '@/locales/applier';

/**
 * 语言偏好 hook：镜像 useThemeToggle。
 * 语言持久化在 localStorage（key: 'locale'），切换时同步
 * vue-i18n locale / <html lang> / dayjs locale / document.title。
 */
export function useLocaleToggle() {
  const locale = useLocalStorage<AppLocale>(LOCALE_STORAGE_KEY, 'en');

  const setLocale = (next: AppLocale) => {
    locale.value = next;
  };

  watch(locale, (value) => applyLocale(value), { immediate: true });

  return { locale, setLocale };
}
