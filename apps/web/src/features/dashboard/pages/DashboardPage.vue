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
import { computed, ref } from 'vue';
import { useCourses } from '@/features/course/hooks/useCourses';
import { useStudents } from '@/features/student/hooks/useStudents';
import { useClassSessions } from '@/features/session/hooks/useClassSessions';
import { useStudentCourses } from '@/features/course/hooks/useStudentCourses';
import { formatDate, formatTime } from '@/utils/date';

const emptyStatus = ref('');
const activeStatus = ref('ACTIVE');
const emptyText = ref('');

const studentTotals = useStudents({
  page: ref(1),
  pageSize: ref(1),
  userId: emptyText,
  q: emptyText,
});
const sessionTotals = useClassSessions({
  page: ref(1),
  pageSize: ref(1),
  studentCourseId: emptyText,
  classDate: emptyText,
});
const activeCourseTotals = useCourses({
  page: ref(1),
  pageSize: ref(1),
  q: emptyText,
  status: activeStatus,
});
const recentSessionsQuery = useClassSessions({
  page: ref(1),
  pageSize: ref(4),
  studentCourseId: emptyText,
  classDate: emptyText,
});
const studentCoursesQuery = useStudentCourses({
  page: ref(1),
  pageSize: ref(100),
  studentId: emptyText,
  courseId: emptyText,
});
const coursesLookupQuery = useCourses({
  page: ref(1),
  pageSize: ref(100),
  q: emptyText,
  status: emptyStatus,
});

const statA = computed(() => ({
  label: 'Active Students',
  value: studentTotals.data.value?.total ?? '0',
  icon: 'i-lucide-users text-blue-600 dark:text-blue-300',
}));
const statB = computed(() => ({
  label: 'Total Hours',
  value: '0.0',
  icon: 'i-lucide-clock-3 text-violet-600 dark:text-violet-300',
}));
const statC = computed(() => ({
  label: 'Total Sessions',
  value: sessionTotals.data.value?.total ?? '0',
  icon: 'i-lucide-calendar-days text-pink-600 dark:text-pink-300',
}));
const statD = computed(() => ({
  label: 'Active Courses',
  value: activeCourseTotals.data.value?.total ?? '0',
  icon: 'i-lucide-book-open text-orange-600 dark:text-orange-300',
}));

const stats = computed(() => [statA.value, statB.value, statC.value, statD.value]);

const sessionsLoading = computed(() => recentSessionsQuery.isLoading.value);
const sessionsError = computed(() => recentSessionsQuery.error.value?.message ?? '');
const recentSessions = computed(() => recentSessionsQuery.data.value?.data ?? []);

const studentCourseLookup = computed(() => {
  const courses = new Map(
    (coursesLookupQuery.data.value?.data ?? []).map((course) => [course.id, course.name]),
  );
  return new Map(
    (studentCoursesQuery.data.value?.data ?? []).map((record) => [
      record.id,
      courses.get(record.courseId) ?? record.courseId,
    ]),
  );
});

function sessionLabel(studentCourseId: string) {
  return studentCourseLookup.value.get(studentCourseId) ?? studentCourseId;
}
</script>
