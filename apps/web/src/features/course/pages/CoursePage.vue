<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <section
        class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c] sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage courses and the enrollment graph around them.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <i class="i-lucide-plus size-4"></i>
          Add Course
        </button>
      </section>

      <section
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Course catalog</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Search and filter the live API records.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:min-w-136 lg:grid-cols-[1fr_12rem]">
            <label class="relative block">
              <i
                class="i-lucide-search absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              ></i>
              <input
                v-model="search"
                type="text"
                placeholder="Search courses..."
                class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </label>

            <select
              v-model="status"
              class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>

        <div v-if="isLoading" class="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-2">
          <div
            v-for="index in 4"
            :key="index"
            class="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#202020]"
          ></div>
        </div>

        <div
          v-else-if="error"
          class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
        >
          {{ error }}
        </div>

        <div
          v-else-if="courses.length === 0"
          class="mt-5 rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500 dark:border-[#3a3a3a] dark:text-gray-400"
        >
          No courses found.
        </div>

        <div v-else class="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-2">
          <article
            v-for="course in courses"
            :key="course.id"
            class="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-[#2f2f2f] dark:bg-[#202020]"
          >
            <div class="bg-linear-to-r from-blue-500 to-indigo-600 px-5 py-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <span class="text-xs font-semibold uppercase tracking-wider text-white/80"
                    >Course</span
                  >
                  <h3 class="mt-0.5 text-lg font-bold text-white">{{ course.name }}</h3>
                </div>
                <span
                  class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white"
                  >{{ course.status }}</span
                >
              </div>
            </div>
            <div class="space-y-4 px-5 py-4">
              <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {{ course.description || 'No description provided.' }}
              </p>
              <div
                class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
              >
                <span>Created {{ formatDateTime(course.createdAt) }}</span>
                <span>Updated {{ formatDateTime(course.updatedAt) }}</span>
              </div>
              <div class="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                >
                  <i class="i-lucide-square-pen size-3.5"></i> Edit
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  <i class="i-lucide-trash-2 size-3.5"></i> Delete
                </button>
              </div>
            </div>
          </article>
        </div>

        <div
          class="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-[#343434] dark:text-gray-400"
        >
          <span>Showing {{ courses.length }} of {{ total }} courses</span>
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
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Student courses</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Enrollment records from the join table.
            </p>
          </div>
          <span
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-[#202020] dark:text-gray-300"
            >{{ studentCourseRecords.length }} records</span
          >
        </div>
        <div v-if="studentCourseLoading" class="mt-5 grid gap-4 md:grid-cols-2">
          <div
            v-for="index in 4"
            :key="index"
            class="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#202020]"
          ></div>
        </div>
        <div
          v-else-if="studentCourseError"
          class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
        >
          {{ studentCourseError }}
        </div>
        <div v-else class="mt-5 grid gap-4 md:grid-cols-2">
          <article
            v-for="record in studentCourseRecords"
            :key="record.id"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3a3a3a] dark:bg-[#202020]"
          >
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ studentCourseLabel(record.studentId, record.courseId) }}
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ record.id }}</p>
          </article>
        </div>
      </section>

      <section
        class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Class rules</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Recurring schedules attached to enrollments.
            </p>
          </div>
          <span
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-[#202020] dark:text-gray-300"
            >{{ classRuleRecords.length }} records</span
          >
        </div>
        <div v-if="classRuleLoading" class="mt-5 grid gap-4 md:grid-cols-2">
          <div
            v-for="index in 4"
            :key="index"
            class="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#202020]"
          ></div>
        </div>
        <div
          v-else-if="classRuleError"
          class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
        >
          {{ classRuleError }}
        </div>
        <div v-else class="mt-5 grid gap-4 md:grid-cols-2">
          <article
            v-for="record in classRuleRecords"
            :key="record.id"
            class="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3a3a3a] dark:bg-[#202020]"
          >
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ studentCourseLookup.get(record.studentCourseId) ?? record.studentCourseId }}
            </p>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(record.startDate) }} →
              {{ record.endDate ? formatDate(record.endDate) : 'No end date' }}
            </p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Every {{ record.intervalDays }} days · {{ formatTime(record.startTime) }} -
              {{ formatTime(record.endTime) }}
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

const page = ref(1);
const pageSize = ref(8);
const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('');

watch([search, status], () => {
  page.value = 1;
});

const courses = ref([
  { id: '1', name: 'Advanced Mathematics', description: 'Covers algebra, geometry, calculus, and statistics for advanced learners.', status: 'ACTIVE', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-05-20T10:30:00Z' },
  { id: '2', name: 'Physics Fundamentals', description: 'A foundational course in Newtonian mechanics, thermodynamics, and electromagnetism.', status: 'ACTIVE', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-05-18T14:00:00Z' },
  { id: '3', name: 'Chemistry Lab', description: 'Hands-on lessons in chemical bonding, organic chemistry, and lab techniques.', status: 'ACTIVE', createdAt: '2026-02-01T07:30:00Z', updatedAt: '2026-05-15T11:00:00Z' },
  { id: '4', name: 'English Literature', description: 'Builds reading comprehension, writing skills, and literary analysis.', status: 'ACTIVE', createdAt: '2026-02-10T08:00:00Z', updatedAt: '2026-05-22T09:00:00Z' },
  { id: '5', name: 'Biology Essentials', description: 'Introduction to cell biology, genetics, and ecology.', status: 'ACTIVE', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-05-25T15:00:00Z' },
  { id: '6', name: 'World History', description: 'Exploring major historical events and civilizations.', status: 'DISABLED', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-04-01T12:00:00Z' },
]);
const total = ref(6);
const isLoading = ref(false);
const error = ref('');

const studentLookup = new Map<string, string>([
  ['s1', 'Alice Johnson'],
  ['s2', 'Bob Smith'],
  ['s3', 'Carol White'],
  ['s4', 'David Lee'],
]);
const courseLookup = new Map<string, string>([
  ['1', 'Advanced Mathematics'],
  ['2', 'Physics Fundamentals'],
  ['3', 'Chemistry Lab'],
  ['4', 'English Literature'],
  ['5', 'Biology Essentials'],
  ['6', 'World History'],
]);
const studentCourseLookup = new Map<string, string>([
  ['sc1', 'Alice Johnson · Advanced Mathematics'],
  ['sc2', 'Bob Smith · Advanced Mathematics'],
  ['sc3', 'Alice Johnson · Physics Fundamentals'],
  ['sc4', 'Carol White · Physics Fundamentals'],
  ['sc5', 'Bob Smith · Chemistry Lab'],
  ['sc6', 'David Lee · Chemistry Lab'],
  ['sc7', 'Alice Johnson · English Literature'],
  ['sc8', 'Carol White · English Literature'],
]);

const studentCourseRecords = ref([
  { id: 'sc1', studentId: 's1', courseId: '1' },
  { id: 'sc2', studentId: 's2', courseId: '1' },
  { id: 'sc3', studentId: 's1', courseId: '2' },
  { id: 'sc4', studentId: 's3', courseId: '2' },
  { id: 'sc5', studentId: 's2', courseId: '3' },
  { id: 'sc6', studentId: 's4', courseId: '3' },
  { id: 'sc7', studentId: 's1', courseId: '4' },
  { id: 'sc8', studentId: 's3', courseId: '4' },
]);
const studentCourseLoading = ref(false);
const studentCourseError = ref('');

const classRuleRecords = ref([
  { id: 'cr1', studentCourseId: 'sc1', startDate: '2026-02-01', endDate: null, intervalDays: 7, startTime: '09:00', endTime: '10:30' },
  { id: 'cr2', studentCourseId: 'sc3', startDate: '2026-02-01', endDate: null, intervalDays: 7, startTime: '10:30', endTime: '12:00' },
  { id: 'cr3', studentCourseId: 'sc5', startDate: '2026-02-01', endDate: '2026-06-30', intervalDays: 7, startTime: '14:00', endTime: '15:30' },
]);
const classRuleLoading = ref(false);
const classRuleError = ref('');

function studentCourseLabel(studentId: string, courseId: string) {
  return `${studentLookup.get(studentId) ?? studentId} · ${courseLookup.get(courseId) ?? courseId}`;
}
</script>
