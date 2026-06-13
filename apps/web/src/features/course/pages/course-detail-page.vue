<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Course Details" description="View the full information of the course." />

      <!-- Loading state -->
      <section
        v-if="isInitialLoading"
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="flex items-center justify-center py-10">
          <i class="i-lucide-loader-circle size-6 animate-spin text-gray-400"></i>
          <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading course data...</span>
        </div>
      </section>

      <!-- Details -->
      <section
        v-else-if="course"
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Name </label>
            <p
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              {{ course.name }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Status </label>
            <p
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-[#3a3a3a] dark:bg-[#202020]"
            >
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="
                  course.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-[#343434] dark:text-gray-400'
                "
              >
                <span
                  class="size-1.5 rounded-full"
                  :class="course.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'"
                ></span>
                {{ course.status === 'ACTIVE' ? 'Active' : 'Disabled' }}
              </span>
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Description
            </label>
            <p
              class="min-h-20 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm whitespace-pre-wrap text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              {{ course.description || 'No description provided.' }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Created At </label>
            <p
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              {{ formatDateTime(course.createdAt) }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Updated At </label>
            <p
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              {{ formatDateTime(course.updatedAt) }}
            </p>
          </div>

          <!-- Back button -->
          <RouterLink
            :to="{ name: 'course.list' }"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:bg-transparent dark:text-gray-300 dark:hover:bg-[#202020]"
          >
            <i class="i-lucide-arrow-left size-4"></i>
            Back to Courses
          </RouterLink>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/date';
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';

const props = defineProps<{
  id: string;
}>();

const { course, isInitialLoading } = useCourseDetail(props.id);
</script>
