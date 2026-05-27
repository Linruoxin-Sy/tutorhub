<template>
  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="stat in stats"
      :key="stat.label"
      class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ stat.value }}
          </p>
        </div>

        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-2xl shadow-sm dark:border-[#3a3a3a] dark:bg-[#202020]"
        >
          <i :class="stat.icon"></i>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
const stats = [
  {
    label: 'Active Students',
    value: '4',
    icon: 'i-lucide-users text-blue-600 dark:text-blue-300',
  },
  {
    label: 'Total Hours',
    value: '6.8',
    icon: 'i-lucide-clock-3 text-violet-600 dark:text-violet-300',
  },
  {
    label: 'Total Sessions',
    value: '6',
    icon: 'i-lucide-calendar-days text-pink-600 dark:text-pink-300',
  },
  {
    label: 'Active Courses',
    value: '4',
    icon: 'i-lucide-book-open text-orange-600 dark:text-orange-300',
  },
];
</script>
