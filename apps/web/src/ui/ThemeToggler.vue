<template>
  <div class="flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-[#202020]">
    <button
      type="button"
      class="size-8 rounded-full flex items-center justify-center text-base transition cursor-pointer"
      :class="
        theme === 'system'
          ? 'bg-white text-gray-900 shadow-sm dark:bg-[#3a3a3a] dark:text-white'
          : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] dark:text-gray-300'
      "
      aria-label="跟随系统主题"
      :aria-pressed="theme === 'system'"
      @click="setTheme('system')"
    >
      <i class="i-lucide-airplay"></i>
    </button>

    <button
      type="button"
      class="size-8 rounded-full flex items-center justify-center text-base transition cursor-pointer"
      :class="
        theme === 'light'
          ? 'bg-white text-amber-500 shadow-sm dark:bg-[#3a3a3a]'
          : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] dark:text-gray-300'
      "
      aria-label="亮色主题"
      :aria-pressed="theme === 'light'"
      @click="setTheme('light')"
    >
      <i class="i-lucide-sun"></i>
    </button>

    <button
      type="button"
      class="size-8 rounded-full flex items-center justify-center text-base transition cursor-pointer"
      :class="
        theme === 'dark'
          ? 'bg-white text-blue-500 shadow-sm dark:bg-[#3a3a3a]'
          : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] dark:text-gray-300'
      "
      aria-label="暗色主题"
      :aria-pressed="theme === 'dark'"
      @click="setTheme('dark')"
    >
      <i class="i-lucide-moon"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useThemeToggle } from '@/hooks/useThemeToggle';

const { theme, setTheme } = useThemeToggle();
</script>
