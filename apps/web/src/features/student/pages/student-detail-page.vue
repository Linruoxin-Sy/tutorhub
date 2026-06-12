<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <!-- Header -->
      <section
        class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Student Details</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View the student's information below.
          </p>
        </div>
        <RouterLink
          :to="{ name: 'student.list' }"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:bg-transparent dark:text-gray-300 dark:hover:bg-[#202020]"
        >
          <i class="i-lucide-arrow-left size-4"></i>
          Back
        </RouterLink>
      </section>

      <!-- Loading state -->
      <section
        v-if="isInitialLoading"
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div class="flex items-center justify-center py-10">
          <i class="i-lucide-loader-circle size-6 animate-spin text-gray-400"></i>
          <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading student data...</span>
        </div>
      </section>

      <!-- Detail content -->
      <section
        v-else-if="student"
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <StudentForm v-model="student" :avatar-url="avatarUrl" readonly />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import StudentForm from '@/features/student/components/StudentForm.vue';
import { useStudentDetailForm } from '@/features/student/hooks/useStudentDetailForm';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const { data: student, isInitialLoading, avatarUrl } = useStudentDetailForm(id);
</script>
