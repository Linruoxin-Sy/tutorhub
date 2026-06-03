<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <section
        class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c] sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search student profiles and inspect linked user accounts.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <i class="i-lucide-plus size-4"></i>
          Add Student
        </button>
      </section>

      <section
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Student directory</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">Powered by the students API.</p>
            </div>
            <div class="grid gap-3 sm:grid-cols-2 lg:min-w-136 lg:grid-cols-[1fr_12rem]">
              <label class="relative block">
                <i
                  class="i-lucide-search absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                ></i>
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search students..."
                  class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
                />
              </label>
              <input
                v-model="userId"
                type="text"
                placeholder="Filter by user ID"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
          Loading students...
        </div>
        <div v-else-if="error" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
          {{ error }}
        </div>
        <div
          v-else-if="students.length === 0"
          class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          No students found.
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
                  class="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-[#343434]">
              <tr
                v-for="student in students"
                :key="student.id"
                class="transition hover:bg-gray-50 dark:hover:bg-[#202020]"
              >
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white shadow-sm"
                    >
                      {{ student.name.charAt(0) }}
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                      student.name
                    }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ student.email || '-' }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ student.phone || '-' }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ student.grade || '-' }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {{ formatDateTime(student.createdAt) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4">
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
          <span>Showing {{ students.length }} of {{ total }} students</span>
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
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Lookup records used in student assignment flows.
            </p>
          </div>
          <span
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-[#202020] dark:text-gray-300"
            >{{ users.length }} records</span
          >
        </div>
        <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="user in users"
            :key="user.id"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3a3a3a] dark:bg-[#202020]"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-sm"
              >
                {{ user.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ user.name }}
                </p>
                <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ user.email || user.phone || 'No contact info' }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatDateTime } from '@/utils/date';

const columns = ['Name', 'Email', 'Phone', 'Grade', 'Created At', 'Actions'];

const page = ref(1);
const pageSize = ref(8);
const search = ref('');
const userId = ref('');

watch([search, userId], () => {
  page.value = 1;
});

const students = ref([
  {
    id: 's1',
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '555-0101',
    grade: '10th Grade',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 's2',
    name: 'Bob Smith',
    email: 'bob@email.com',
    phone: '555-0102',
    grade: '11th Grade',
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 's3',
    name: 'Carol White',
    email: 'carol@email.com',
    phone: '555-0103',
    grade: '9th Grade',
    createdAt: '2026-02-01T07:30:00Z',
  },
  {
    id: 's4',
    name: 'David Lee',
    email: 'david@email.com',
    phone: '555-0104',
    grade: '10th Grade',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 's5',
    name: 'Eva Martinez',
    email: 'eva@email.com',
    phone: '555-0105',
    grade: '12th Grade',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 's6',
    name: 'Frank Wilson',
    email: 'frank@email.com',
    phone: '555-0106',
    grade: '10th Grade',
    createdAt: '2026-03-05T11:00:00Z',
  },
]);
const total = ref(6);
const isLoading = ref(false);
const error = ref('');

const users = ref([
  { id: 'u1', name: 'Alice Johnson', email: 'alice@email.com', phone: null },
  { id: 'u2', name: 'Bob Smith', email: 'bob@email.com', phone: null },
  { id: 'u3', name: 'Carol White', email: 'carol@email.com', phone: null },
  { id: 'u4', name: 'David Lee', email: 'david@email.com', phone: null },
]);
</script>
