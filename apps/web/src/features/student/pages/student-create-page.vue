<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <!-- Header -->
      <section
        class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Student</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to add a new student.
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

      <!-- Form -->
      <section
        class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <StudentForm v-model="data" @avatar-change="handlePendingFile">
          <template #actions>
            <button
              :disabled="isSubmitting"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="submit"
            >
              <span v-if="isSubmitting">Creating...</span>
              <span v-else>Create Student</span>
            </button>
          </template>
        </StudentForm>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useStudentCreateForm } from '@/features/student/hooks/useStudentCreateForm';
import StudentForm from '@/features/student/components/StudentForm.vue';

const { data, submit, isSubmitting, handlePendingFile } = useStudentCreateForm();
</script>
