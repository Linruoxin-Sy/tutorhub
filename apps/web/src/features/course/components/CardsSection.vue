<template>
  <section class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
    <article
      v-for="course in courses"
      :key="course.title"
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <div class="px-5 py-4" :class="course.headerClass">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-white/80">
              {{ course.subject }}
            </span>
            <h3 class="mt-0.5 text-lg font-bold text-white">{{ course.title }}</h3>
          </div>

          <span class="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
            {{ course.status }}
          </span>
        </div>
      </div>

      <div class="space-y-4 px-5 py-4">
        <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {{ course.description }}
        </p>

        <div>
          <p
            class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Enrolled Students ({{ course.students.length }})
          </p>

          <div class="flex flex-wrap gap-2">
            <div
              v-for="student in course.students"
              :key="student.name"
              class="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-[#363636]"
            >
              <div
                class="flex size-5 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-violet-500 text-xs font-bold text-white"
              >
                {{ student.initial }}
              </div>
              <span class="text-xs font-medium text-gray-700 dark:text-gray-200">{{
                student.name
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
            :aria-label="`Edit ${course.title}`"
          >
            <i class="i-lucide-square-pen size-3.5"></i>
            Edit
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
            :aria-label="`Delete ${course.title}`"
          >
            <i class="i-lucide-trash-2 size-3.5"></i>
            Delete
          </button>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
type Course = {
  subject: string;
  title: string;
  description: string;
  status: string;
  headerClass: string;
  students: Array<{
    initial: string;
    name: string;
  }>;
};

const courses: Course[] = [
  {
    subject: 'Mathematics',
    title: 'Advanced Mathematics',
    description: 'Covers algebra, geometry, calculus, and statistics for advanced learners.',
    status: 'In Progress',
    headerClass: 'bg-linear-to-r from-blue-500 to-indigo-600',
    students: [
      { initial: 'A', name: 'Alice' },
      { initial: 'B', name: 'Bob' },
    ],
  },
  {
    subject: 'Physics',
    title: 'Physics Fundamentals',
    description:
      'A foundational course in Newtonian mechanics, thermodynamics, and electromagnetism.',
    status: 'In Progress',
    headerClass: 'bg-linear-to-r from-violet-500 to-purple-600',
    students: [
      { initial: 'A', name: 'Alice' },
      { initial: 'C', name: 'Carol' },
    ],
  },
  {
    subject: 'Chemistry',
    title: 'Chemistry Lab',
    description: 'Hands-on lessons in chemical bonding, organic chemistry, and lab techniques.',
    status: 'In Progress',
    headerClass: 'bg-linear-to-r from-emerald-500 to-green-600',
    students: [
      { initial: 'B', name: 'Bob' },
      { initial: 'D', name: 'David' },
    ],
  },
  {
    subject: 'English',
    title: 'English Literature',
    description: 'Builds reading comprehension, writing skills, and literary analysis.',
    status: 'In Progress',
    headerClass: 'bg-linear-to-r from-pink-500 to-rose-600',
    students: [
      { initial: 'A', name: 'Alice' },
      { initial: 'C', name: 'Carol' },
    ],
  },
];
</script>
