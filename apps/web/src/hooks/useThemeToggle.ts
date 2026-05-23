import { useLocalStorage } from '@vueuse/core';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

export function useThemeToggle() {
  const theme = useLocalStorage<ThemeMode>(STORAGE_KEY, 'system');
  const systemDark = ref(false);
  const isDark = computed(
    () => theme.value === 'dark' || (theme.value === 'system' && systemDark.value),
  );

  let mediaQuery: MediaQueryList | null = null;
  let mediaQueryHandler: ((event: MediaQueryListEvent) => void) | null = null;

  const syncDocumentTheme = () => {
    if (!isClient) return;

    document.documentElement.classList.toggle('dark', isDark.value);
  };

  const setTheme = (nextTheme: ThemeMode) => {
    theme.value = nextTheme;
  };

  const updateSystemTheme = () => {
    if (!isClient) return;

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.value = mediaQuery.matches;
  };

  if (isClient) {
    updateSystemTheme();
  }

  watch([theme, systemDark], syncDocumentTheme, { immediate: true });

  onMounted(() => {
    if (!isClient) return;

    mediaQuery ??= window.matchMedia('(prefers-color-scheme: dark)');

    mediaQueryHandler = (event) => {
      systemDark.value = event.matches;
    };

    mediaQuery.addEventListener('change', mediaQueryHandler);
  });

  onBeforeUnmount(() => {
    if (!mediaQuery || !mediaQueryHandler) return;

    mediaQuery.removeEventListener('change', mediaQueryHandler);
  });

  return {
    theme,
    isDark,
    setTheme,
  };
}
