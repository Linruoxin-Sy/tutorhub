<template>
  <section
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full">
        <thead class="border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]">
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
            :key="session.course + session.date"
            class="transition hover:bg-gray-50 dark:hover:bg-[#202020]"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <div
                  :class="[
                    'flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-white shadow-sm',
                    session.avatarClass,
                  ]"
                >
                  <i class="i-lucide-book-open size-4"></i>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ session.course }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ session.subject }}</p>
                </div>
              </div>
            </td>

            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="student in session.students"
                  :key="student"
                  class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-[#3a3a3a] dark:text-gray-200"
                >
                  {{ student }}
                </span>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5">
                <i class="i-lucide-clock size-3.5 text-gray-400"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ session.duration }}</span>
              </div>
            </td>

            <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
              {{ session.date }}
            </td>

            <td class="max-w-xs px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              <span class="block truncate">{{ session.notes }}</span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <button
                type="button"
                class="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                aria-label="Delete session"
              >
                <i class="i-lucide-trash-2 size-4"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
const columns = ['Course', 'Enrolled Students', 'Duration', 'Date', 'Notes', ''];

const sessions = [
  {
    course: 'Physics Fundamentals',
    subject: 'Physics',
    students: ['Alice', 'Carol'],
    duration: '60 min',
    date: '2026-04-02',
    notes: 'Energy conservation and thermodynamics.',
    avatarClass: 'from-purple-500 to-violet-600',
  },
  {
    course: 'Advanced Mathematics',
    subject: 'Mathematics',
    students: ['Alice', 'Bob'],
    duration: '90 min',
    date: '2026-03-31',
    notes: 'Geometry and trigonometry review.',
    avatarClass: 'from-blue-500 to-indigo-600',
  },
  {
    course: 'English Literature',
    subject: 'English',
    students: ['Alice', 'Carol'],
    duration: '45 min',
    date: '2026-03-30',
    notes: 'Essay writing workshop and peer review.',
    avatarClass: 'from-pink-500 to-rose-600',
  },
  {
    course: 'Physics Fundamentals',
    subject: 'Physics',
    students: ['Alice', 'Carol'],
    duration: '90 min',
    date: '2026-03-29',
    notes: "Newton's laws of motion with demonstrations.",
    avatarClass: 'from-purple-500 to-violet-600',
  },
  {
    course: 'Advanced Mathematics',
    subject: 'Mathematics',
    students: ['Alice', 'Bob'],
    duration: '60 min',
    date: '2026-03-28',
    notes: 'Covered algebraic equations and practice problems.',
    avatarClass: 'from-blue-500 to-indigo-600',
  },
  {
    course: 'Chemistry Lab',
    subject: 'Chemistry',
    students: ['Bob', 'David'],
    duration: '60 min',
    date: '2026-03-28',
    notes: 'Chemical bonding and molecular structures.',
    avatarClass: 'from-green-500 to-emerald-600',
  },
];
</script>
