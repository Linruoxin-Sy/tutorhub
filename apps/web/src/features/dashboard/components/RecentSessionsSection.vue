<template>
  <article
    class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
  >
    <header class="border-b border-gray-100 px-5 py-4 dark:border-[#343434]">
      <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
    </header>

    <div class="space-y-3 p-4 sm:p-5">
      <div
        v-for="session in recentSessions"
        :key="session.title + session.date"
        class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-[#202020]"
      >
        <div
          :class="[
            'flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-700 shadow-sm dark:bg-[#3a3a3a] dark:text-gray-200',
          ]"
        >
          <i class="i-lucide-book-open text-sm"></i>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
            {{ session.title }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ session.date }}</p>
        </div>

        <span class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-200">
          {{ session.duration }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const recentSessions = [
  {
    title: 'Physics Fundamentals',
    date: '2026-04-02',
    duration: '60m',
  },
  {
    title: 'Advanced Mathematics',
    date: '2026-03-31',
    duration: '90m',
  },
  {
    title: 'English Literature',
    date: '2026-03-30',
    duration: '45m',
  },
  {
    title: 'Physics Fundamentals',
    date: '2026-03-29',
    duration: '90m',
  },
];
</script>
