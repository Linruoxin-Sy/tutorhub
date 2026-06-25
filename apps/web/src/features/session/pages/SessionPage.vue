<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader
        title="Session Overrides"
        description="Review cancelled or rescheduled class sessions."
      />

      <CardSection class="overflow-hidden">
        <div class="border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Session overrides</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Cancelled or rescheduled sessions across your courses.
              </p>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
          Loading session overrides...
        </div>
        <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
          {{ error }}
        </div>
        <div
          v-else-if="sessions.length === 0"
          class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          No session overrides found.
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
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ formatDate(session.originalDate) }}
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
                  <AppButton variant="secondary" @click="viewOverride(session.id)">
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
import { fetchClassSessionOverrides } from '@/features/class-session/api/class-session-api';
import { formatDate } from '@/utils/date';
import type { ClassSessionOverrideListItem } from '@tutorhub/schema';

const router = useRouter();

const columns = ['Original Date', 'Status', 'Actions'];

const limit = 20;
const offset = ref(0);
const total = ref(0);
const sessions = ref<ClassSessionOverrideListItem[]>([]);
const isLoading = ref(false);
const error = ref('');

watch(offset, () => {
  loadOverrides();
});

function stateLabel(state: string): string {
  const map: Record<string, string> = {
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
  };
  return map[state] ?? state;
}

function stateBadgeClass(state: string): string {
  const map: Record<string, string> = {
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

function viewOverride(overrideId: string) {
  router.push(`/class-session-override/${overrideId}`);
}

async function loadOverrides() {
  isLoading.value = true;
  error.value = '';
  try {
    const result = await fetchClassSessionOverrides({
      offset: offset.value,
      limit,
    });
    sessions.value = result.items;
    total.value = result.total;
  } catch {
    error.value = 'Failed to load session overrides';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await loadOverrides();
});
</script>
