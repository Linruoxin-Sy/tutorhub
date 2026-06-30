<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <!-- Stats cards -->
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

      <!-- Recent sessions (full width) -->
      <article
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <header class="border-b border-gray-100 px-5 py-4 dark:border-[#343434]">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Recent sessions</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Upcoming and ongoing classes.</p>
        </header>

        <div v-if="isLoading" class="space-y-3 p-5">
          <div
            v-for="index in 4"
            :key="index"
            class="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-[#202020]"
          ></div>
        </div>

        <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
          Failed to load sessions.
        </div>

        <div v-else class="space-y-3 p-5">
          <div v-if="recentSessions.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
            No upcoming sessions.
          </div>
          <div
            v-for="session in recentSessions"
            :key="session.id"
            class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-[#202020]"
          >
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-violet-600 text-white shadow-sm"
            >
              <i class="i-lucide-book-open text-sm"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ session.courseName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ session.date }} · {{ session.startTime }} - {{ session.endTime }}
              </p>
              <p
                v-if="session.studentNames.length > 0"
                class="mt-0.5 text-xs text-gray-400 dark:text-gray-500"
              >
                {{ session.studentNames.join(', ') }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="
                session.status === 'ongoing'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              "
            >
              {{ session.status === 'ongoing' ? 'Ongoing' : 'Upcoming' }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { request } from '@/utils/request';

import type { DashboardResponse } from '@tutorhub/schema';

const { data, isLoading, error } = useQuery<DashboardResponse>({
  queryKey: ['dashboard'],
  queryFn: async () => {
    const res = await request.get('/dashboard');
    return res.data;
  },
});

const stats = computed(() => {
  const d = data.value;
  if (!d) return [];
  return [
    {
      label: 'Active Students',
      value: String(d.activeStudents),
      icon: 'i-lucide-users text-blue-600 dark:text-blue-300',
    },
    {
      label: 'Active Courses',
      value: String(d.activeCourses),
      icon: 'i-lucide-book-open text-orange-600 dark:text-orange-300',
    },
    {
      label: 'Total Hours',
      value: String(d.totalHours),
      icon: 'i-lucide-clock-3 text-violet-600 dark:text-violet-300',
    },
    {
      label: 'Total Income',
      value: `$${d.totalIncome.toLocaleString()}`,
      icon: 'i-lucide-dollar-sign text-pink-600 dark:text-pink-300',
    },
  ];
});

const recentSessions = computed(() => data.value?.recentSessions ?? []);
</script>
