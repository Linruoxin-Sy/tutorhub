<template>
  <section
    class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c] sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Class Sessions</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">所有已記錄的上課記錄</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <i class="i-lucide-plus size-4"></i>
      Log Session
    </button>
  </section>
</template>

<script setup lang="ts"></script>
