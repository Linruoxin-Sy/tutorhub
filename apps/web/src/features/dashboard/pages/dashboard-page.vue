<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <!-- Stats cards -->
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.labelKey"
          class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                <T :keypath="stat.labelKey" />
              </p>
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
      <ListPageShell
        title-key="dashboard.recentSessions.title"
        description-key="dashboard.recentSessions.description"
      >
        <div v-if="isLoading" class="space-y-3 p-5">
          <div
            v-for="index in 4"
            :key="index"
            class="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-[#202020]"
          ></div>
        </div>

        <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
          <T keypath="dashboard.recentSessions.loadError" />
        </div>

        <div v-else class="space-y-3 p-5">
          <div v-if="recentSessions.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
            <T keypath="dashboard.recentSessions.empty" />
          </div>
          <div v-for="session in recentSessions" :key="session.id">
            <SessionItem
              :course-name="session.courseName"
              :date="session.date"
              :start-time="session.startTime"
              :end-time="session.endTime"
              :status="session.status"
              @view="goToClassRule(session.ruleId)"
            />
            <p
              v-if="session.studentNames.length > 0"
              class="mt-1 px-5 text-xs text-gray-500 dark:text-gray-400"
            >
              <T keypath="common.misc.studentsPrefix" /> {{ session.studentNames.join(', ') }}
            </p>
          </div>
        </div>
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { request } from '@/utils/request';
import ListPageShell from '@/components/ListPageShell.vue';
import SessionItem from '@/features/session/components/SessionItem.vue';
import { usePreferredCurrency } from '@/hooks/useCurrency';
import { formatMoney } from '@/utils/currency';

import type { DashboardResponse } from '@tutorhub/schema';

const { preferredCurrency } = usePreferredCurrency();

const { data, isLoading, error } = useQuery<DashboardResponse>({
  queryKey: ['dashboard', preferredCurrency],
  queryFn: async () => {
    const res = await request.get('/dashboard', {
      params: { currency: preferredCurrency.value },
    });
    return res.data;
  },
});

const stats = computed(() => {
  const d = data.value;
  if (!d) return [];
  return [
    {
      labelKey: 'dashboard.stats.activeStudents',
      value: String(d.activeStudents),
      icon: 'i-lucide-users text-blue-600 dark:text-blue-300',
    },
    {
      labelKey: 'dashboard.stats.activeCourses',
      value: String(d.activeCourses),
      icon: 'i-lucide-book-open text-orange-600 dark:text-orange-300',
    },
    {
      labelKey: 'dashboard.stats.totalHours',
      value: String(d.totalHours),
      icon: 'i-lucide-clock-3 text-violet-600 dark:text-violet-300',
    },
    {
      labelKey: 'dashboard.stats.totalIncome',
      value: formatMoney(d.totalIncome, d.currency),
      icon: 'i-lucide-dollar-sign text-pink-600 dark:text-pink-300',
    },
  ];
});

const recentSessions = computed(() => data.value?.recentSessions ?? []);

const router = useRouter();

function goToClassRule(ruleId: string) {
  router.push({ name: 'class-rule.detail', params: { ruleId } });
}
</script>
