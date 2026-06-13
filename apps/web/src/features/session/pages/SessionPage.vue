<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Sessions" description="Review session records and exception history." />

      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <i class="i-lucide-plus size-4"></i>
          Log Session
        </button>
      </div>

      <section
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Class sessions</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Directly connected to the class-session endpoint.
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:min-w-136 lg:grid-cols-[1fr_12rem]">
              <input
                v-model="studentCourseId"
                type="text"
                placeholder="Filter by student course ID"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
              <input
                v-model="classDate"
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
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                      sessionLookup.get(session.studentCourseId) ?? session.studentCourseId
                    }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ formatDate(session.classDate) }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ formatTime(session.startTime) }} - {{ formatTime(session.endTime) }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ formatDateTime(session.createdAt) }}
                </td>
                <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ session.studentCourseId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                    >
                      <i class="i-lucide-square-pen size-4"></i></button
                    ><button
                      type="button"
                      class="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      <i class="i-lucide-trash-2 size-4"></i>
                    </button>
                  </div>
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
              :disabled="page <= 1"
              @click="page -= 1"
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-200 px-3 py-1.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a3a3a] dark:hover:bg-[#202020]"
              :disabled="page * pageSize >= total"
              @click="page += 1"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Leave records</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Attendance exceptions linked to sessions.
            </p>
          </div>
          <span
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-[#202020] dark:text-gray-300"
            >{{ leaveRecords.length }} records</span
          >
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="record in leaveRecords"
            :key="record.id"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3a3a3a] dark:bg-[#202020]"
          >
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ sessionLookup.get(record.classSessionId) ?? record.classSessionId }}
            </p>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ record.reason || 'No reason provided.' }}
            </p>
          </article>
        </div>
      </section>

      <section
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Reschedule records</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              History of original and replacement sessions.
            </p>
          </div>
          <span
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-[#202020] dark:text-gray-300"
            >{{ reschedules.length }} records</span
          >
        </div>
        <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="record in reschedules"
            :key="record.id"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3a3a3a] dark:bg-[#202020]"
          >
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ sessionLookup.get(record.originalSessionId) ?? record.originalSessionId }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              → {{ sessionLookup.get(record.newSessionId) ?? record.newSessionId }}
            </p>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ record.reason || 'No reason provided.' }}
            </p>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatDate, formatDateTime, formatTime } from '@/utils/date';

const columns = ['Session', 'Date', 'Duration', 'Created At', 'Student Course', 'Actions'];

const page = ref(1);
const pageSize = ref(8);
const studentCourseId = ref('');
const classDate = ref('');

watch([studentCourseId, classDate], () => {
  page.value = 1;
});

const sessions = ref([
  {
    id: 'ses1',
    studentCourseId: 'sc1',
    classDate: '2026-04-02',
    startTime: '09:00',
    endTime: '10:30',
    createdAt: '2026-04-02T08:00:00Z',
  },
  {
    id: 'ses2',
    studentCourseId: 'sc3',
    classDate: '2026-04-02',
    startTime: '10:30',
    endTime: '12:00',
    createdAt: '2026-04-02T08:00:00Z',
  },
  {
    id: 'ses3',
    studentCourseId: 'sc1',
    classDate: '2026-03-31',
    startTime: '09:00',
    endTime: '10:30',
    createdAt: '2026-03-31T08:00:00Z',
  },
  {
    id: 'ses4',
    studentCourseId: 'sc5',
    classDate: '2026-03-31',
    startTime: '14:00',
    endTime: '15:30',
    createdAt: '2026-03-31T08:00:00Z',
  },
  {
    id: 'ses5',
    studentCourseId: 'sc7',
    classDate: '2026-03-30',
    startTime: '09:00',
    endTime: '09:45',
    createdAt: '2026-03-30T08:00:00Z',
  },
  {
    id: 'ses6',
    studentCourseId: 'sc1',
    classDate: '2026-03-28',
    startTime: '09:00',
    endTime: '10:00',
    createdAt: '2026-03-28T08:00:00Z',
  },
]);
const total = ref(6);
const isLoading = ref(false);
const error = ref('');

const sessionLookup = new Map<string, string>([
  ['ses1', 'Alice Johnson · Advanced Mathematics'],
  ['ses2', 'Alice Johnson · Physics Fundamentals'],
  ['ses3', 'Alice Johnson · Advanced Mathematics'],
  ['ses4', 'Bob Smith · Chemistry Lab'],
  ['ses5', 'Alice Johnson · English Literature'],
  ['ses6', 'Alice Johnson · Advanced Mathematics'],
]);

const leaveRecords = ref([
  { id: 'lr1', classSessionId: 'ses3', reason: 'Sick leave' },
  { id: 'lr2', classSessionId: 'ses5', reason: 'Family emergency' },
]);

const reschedules = ref([
  {
    id: 'rr1',
    originalSessionId: 'ses3',
    newSessionId: 'ses6',
    reason: 'Student requested reschedule',
  },
]);
</script>
