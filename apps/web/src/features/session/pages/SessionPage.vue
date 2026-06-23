<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Sessions" description="Review class session records." />

      <CardSection class="overflow-hidden">
        <div class="border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Class sessions</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                All class sessions across your courses.
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:min-w-136 lg:grid-cols-[1fr_12rem]">
              <select
                v-model="selectedCourseId"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
              >
                <option value="">All courses</option>
                <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <input
                v-model="dateFilter"
                type="date"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
              />
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
          Loading sessions...
        </div>
        <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
          {{ error }}
        </div>
        <div
          v-else-if="sessions.length === 0"
          class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          No class sessions found.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full">
            <thead
              class="border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
            >
              <tr>
                <th
                  v-for="column in columns"
                  :key="column"
                  class="px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-[#343434]">
              <tr
                v-for="session in sessions"
                :key="session.id"
                class="transition hover:bg-gray-50 dark:hover:bg-[#202020]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white shadow-sm"
                    >
                      <i class="i-lucide-book-open size-4"></i>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ session.course?.name ?? '-' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ formatDate(session.occurrenceDate) }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ formatTime(session.startTime) }} – {{ formatTime(session.endTime) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="stateBadgeClass(session.state)"
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  >
                    {{ stateLabel(session.state) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <AppButton variant="secondary" @click="viewSession(session.id)">
                    <i class="i-lucide-eye size-3.5" />
                    View
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-500 dark:border-[#343434] dark:text-gray-400"
        >
          <span>Showing {{ sessions.length }} of {{ total }} sessions</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a3a3a] dark:hover:bg-[#202020]"
              :disabled="offset <= 0"
              @click="prevPage"
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a3a3a] dark:hover:bg-[#202020]"
              :disabled="offset + limit >= total"
              @click="nextPage"
            >
              Next
            </button>
          </div>
        </div>
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchClassSessions } from '@/features/class-session/api/class-session-api';
import { fetchCourses } from '@/features/course/api/course-api';
import { formatDate, formatTime } from '@/utils/date';
import type { ClassSessionListItem } from '@tutorhub/schema';

const router = useRouter();

const columns = ['Course', 'Date', 'Time', 'Status', 'Actions'];

const limit = 20;
const offset = ref(0);
const total = ref(0);
const selectedCourseId = ref('');
const dateFilter = ref('');
const sessions = ref<ClassSessionListItem[]>([]);
const courses = ref<{ id: string; name: string }[]>([]);
const isLoading = ref(false);
const error = ref('');

watch([selectedCourseId, dateFilter, offset], () => {
  loadSessions();
});

function stateLabel(state: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    LEAVE: 'Leave',
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
  };
  return map[state] ?? state;
}

function stateBadgeClass(state: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    LEAVE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    RESCHEDULED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return map[state] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
}

function prevPage() {
  offset.value = Math.max(0, offset.value - limit);
}

function nextPage() {
  offset.value += limit;
}

function viewSession(sessionId: string) {
  const session = sessions.value.find((s) => s.id === sessionId);
  if (session) {
    router.push(`/course/${session.courseId}/session/${sessionId}`);
  }
}

async function loadSessions() {
  isLoading.value = true;
  error.value = '';
  try {
    const result = await fetchClassSessions({
      courseId: selectedCourseId.value || undefined,
      dateFrom: dateFilter.value || undefined,
      offset: offset.value,
      limit,
    });
    sessions.value = result.items;
    total.value = result.total;
  } catch {
    error.value = 'Failed to load sessions';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  try {
    const result = await fetchCourses({ limit: 100 });
    courses.value = result.items.map((c: { id: string; name: string }) => ({
      id: c.id,
      name: c.name,
    }));
  } catch {
    // courses optional
  }
  await loadSessions();
});
</script>
