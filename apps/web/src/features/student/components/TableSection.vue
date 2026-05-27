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
              class="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
            >
              {{ column }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-[#343434]">
          <tr
            v-for="student in students"
            :key="student.email"
            class="transition hover:bg-gray-50 dark:hover:bg-[#202020]"
          >
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white shadow-sm"
                >
                  {{ student.initial }}
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ student.name }}
                </span>
              </div>
            </td>

            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ student.email }}
            </td>

            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ student.phone }}
            </td>

            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
              {{ student.grade }}
            </td>

            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="course in student.courses"
                  :key="course"
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="coursePillClass(course)"
                >
                  {{ course }}
                </span>
              </div>
            </td>

            <td class="whitespace-nowrap px-6 py-4">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                :class="statusClass(student.status)"
              >
                {{ student.status }}
              </span>
            </td>

            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                  aria-label="Edit student"
                >
                  <i class="i-lucide-square-pen size-4"></i>
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                  aria-label="Delete student"
                >
                  <i class="i-lucide-trash-2 size-4"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
type StudentStatus = 'active' | 'inactive' | 'pending';

const columns = ['Name', 'Email', 'Phone', 'Grade', 'Enrolled Courses', 'Status', 'Actions'];

const students = [
  {
    initial: 'A',
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '555-0101',
    grade: '10th Grade',
    courses: ['Mathematics', 'Physics', 'English'],
    status: 'active' as StudentStatus,
  },
  {
    initial: 'B',
    name: 'Bob Smith',
    email: 'bob@email.com',
    phone: '555-0102',
    grade: '11th Grade',
    courses: ['Mathematics', 'Chemistry'],
    status: 'active' as StudentStatus,
  },
  {
    initial: 'C',
    name: 'Carol White',
    email: 'carol@email.com',
    phone: '555-0103',
    grade: '9th Grade',
    courses: ['Physics', 'English'],
    status: 'active' as StudentStatus,
  },
  {
    initial: 'D',
    name: 'David Lee',
    email: 'david@email.com',
    phone: '555-0104',
    grade: '10th Grade',
    courses: ['Chemistry'],
    status: 'active' as StudentStatus,
  },
];

function coursePillClass(course: string) {
  const palette: Record<string, string> = {
    Mathematics: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    Physics: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    English: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
    Chemistry: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  };

  return palette[course] ?? 'bg-gray-100 text-gray-700 dark:bg-[#3a3a3a] dark:text-gray-200';
}

function statusClass(status: StudentStatus) {
  const palette: Record<StudentStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-[#3a3a3a] dark:text-gray-200',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  };

  return palette[status];
}
</script>
