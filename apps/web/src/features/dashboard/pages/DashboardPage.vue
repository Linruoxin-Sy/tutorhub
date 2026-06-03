<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
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

      <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
        >
          <header class="border-b border-gray-100 px-5 py-4 dark:border-[#343434]">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Teaching overview</h2>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Live metrics and recent context from the API.
            </p>
          </header>

          <div class="grid gap-3 p-5 sm:grid-cols-2">
            <div class="rounded-xl bg-gray-50 p-4 dark:bg-[#202020]">
              <p class="text-xs text-gray-500 dark:text-gray-400">Courses</p>
              <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ statA.value }}</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-4 dark:bg-[#202020]">
              <p class="text-xs text-gray-500 dark:text-gray-400">Students</p>
              <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ statB.value }}</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-4 dark:bg-[#202020]">
              <p class="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
              <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ statC.value }}</p>
            </div>
            <div class="rounded-xl bg-gray-50 p-4 dark:bg-[#202020]">
              <p class="text-xs text-gray-500 dark:text-gray-400">Active courses</p>
              <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ statD.value }}</p>
            </div>
          </div>
        </article>

        <article
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
        >
          <header class="border-b border-gray-100 px-5 py-4 dark:border-[#343434]">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Recent sessions</h2>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Newest class activity from the session API.
            </p>
          </header>

          <div v-if="sessionsLoading" class="space-y-3 p-5">
            <div
              v-for="index in 4"
              :key="index"
              class="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-[#202020]"
            ></div>
          </div>

          <div v-else-if="sessionsError" class="px-5 py-4 text-sm text-red-700 dark:text-red-200">
            {{ sessionsError }}
          </div>

          <div v-else class="space-y-3 p-5">
            <div
              v-if="recentSessions.length === 0"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              No sessions found.
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
                  {{ sessionLabel(session.studentCourseId) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(session.classDate) }} · {{ formatTime(session.startTime) }} -
                  {{ formatTime(session.endTime) }}
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { formatDate, formatTime } from '@/utils/date';

const fakeStats = {
  activeStudents: { total: 42 },
  totalSessions: { total: 156 },
  activeCourses: { total: 8 },
};

const fakeRecentSessions = [
  {
    id: '1',
    studentCourseId: 'sc1',
    classDate: '2025-02-10',
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: '2',
    studentCourseId: 'sc2',
    classDate: '2025-02-10',
    startTime: '10:30',
    endTime: '11:30',
  },
  {
    id: '3',
    studentCourseId: 'sc3',
    classDate: '2025-02-09',
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    id: '4',
    studentCourseId: 'sc1',
    classDate: '2025-02-09',
    startTime: '16:00',
    endTime: '17:00',
  },
];

const fakeStudentCourses = [
  { id: 'sc1', courseId: 'c1' },
  { id: 'sc2', courseId: 'c2' },
  { id: 'sc3', courseId: 'c3' },
];

const fakeCourses = [
  { id: 'c1', name: 'Algebra I' },
  { id: 'c2', name: 'English Literature' },
  { id: 'c3', name: 'Physics Fundamentals' },
];

const statA = computed(() => ({
  label: 'Active Students',
  value: String(fakeStats.activeStudents.total),
  icon: 'i-lucide-users text-blue-600 dark:text-blue-300',
}));
const statB = computed(() => ({
  label: 'Total Hours',
  value: '156.5',
  icon: 'i-lucide-clock-3 text-violet-600 dark:text-violet-300',
}));
const statC = computed(() => ({
  label: 'Total Sessions',
  value: String(fakeStats.totalSessions.total),
  icon: 'i-lucide-calendar-days text-pink-600 dark:text-pink-300',
}));
const statD = computed(() => ({
  label: 'Active Courses',
  value: String(fakeStats.activeCourses.total),
  icon: 'i-lucide-book-open text-orange-600 dark:text-orange-300',
}));

const stats = computed(() => [statA.value, statB.value, statC.value, statD.value]);

const sessionsLoading = ref(false);
const sessionsError = ref('');
const recentSessions = ref(fakeRecentSessions);

const studentCourseLookup = computed(() => {
  const courses = new Map(
    fakeCourses.map((course: { id: string; name: string }) => [course.id, course.name]),
  );
  return new Map(
    fakeStudentCourses.map((record: { id: string; courseId: string }) => [
      record.id,
      courses.get(record.courseId) ?? record.courseId,
    ]),
  );
});

function sessionLabel(studentCourseId: string) {
  return studentCourseLookup.value.get(studentCourseId) ?? studentCourseId;
}
</script>
