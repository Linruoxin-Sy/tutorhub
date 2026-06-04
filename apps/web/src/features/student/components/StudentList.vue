<template>
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
  <div v-else class="flex-1 overflow-auto">
    <table class="min-w-full">
      <thead
        class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
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
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/date';

const columns = ['Name', 'Email', 'Phone', 'Grade', 'Created At', 'Actions'];

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
  {
    id: 's7',
    name: 'Grace Kim',
    email: 'grace@email.com',
    phone: '555-0107',
    grade: '11th Grade',
    createdAt: '2026-03-10T09:30:00Z',
  },
  {
    id: 's8',
    name: 'Henry Brown',
    email: 'henry@email.com',
    phone: '555-0108',
    grade: '9th Grade',
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 's9',
    name: 'Ivy Chen',
    email: 'ivy@email.com',
    phone: '555-0109',
    grade: '12th Grade',
    createdAt: '2026-03-20T08:45:00Z',
  },
  {
    id: 's10',
    name: 'Jack Davis',
    email: 'jack@email.com',
    phone: '555-0110',
    grade: '10th Grade',
    createdAt: '2026-03-25T14:00:00Z',
  },
  {
    id: 's11',
    name: 'Karen Taylor',
    email: 'karen@email.com',
    phone: '555-0111',
    grade: '11th Grade',
    createdAt: '2026-04-01T11:15:00Z',
  },
  {
    id: 's12',
    name: 'Leo Garcia',
    email: 'leo@email.com',
    phone: '555-0112',
    grade: '9th Grade',
    createdAt: '2026-04-05T13:30:00Z',
  },
  {
    id: 's13',
    name: 'Mia Anderson',
    email: 'mia@email.com',
    phone: '555-0113',
    grade: '10th Grade',
    createdAt: '2026-04-10T07:00:00Z',
  },
  {
    id: 's14',
    name: 'Noah Thomas',
    email: 'noah@email.com',
    phone: '555-0114',
    grade: '11th Grade',
    createdAt: '2026-04-15T16:20:00Z',
  },
  {
    id: 's15',
    name: 'Olivia Jackson',
    email: 'olivia@email.com',
    phone: '555-0115',
    grade: '12th Grade',
    createdAt: '2026-04-20T09:10:00Z',
  },
  {
    id: 's16',
    name: 'Patrick Harris',
    email: 'patrick@email.com',
    phone: '555-0116',
    grade: '10th Grade',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 's17',
    name: 'Quinn Martin',
    email: 'quinn@email.com',
    phone: '555-0117',
    grade: '9th Grade',
    createdAt: '2026-05-05T08:30:00Z',
  },
  {
    id: 's18',
    name: 'Rachel Moore',
    email: 'rachel@email.com',
    phone: '555-0118',
    grade: '11th Grade',
    createdAt: '2026-05-10T12:00:00Z',
  },
  {
    id: 's19',
    name: 'Samuel Clark',
    email: 'samuel@email.com',
    phone: '555-0119',
    grade: '12th Grade',
    createdAt: '2026-05-15T15:45:00Z',
  },
  {
    id: 's20',
    name: 'Tina Rodriguez',
    email: 'tina@email.com',
    phone: '555-0120',
    grade: '10th Grade',
    createdAt: '2026-05-20T11:30:00Z',
  },
]);

const isLoading = ref(false);
const error = ref('');
</script>
