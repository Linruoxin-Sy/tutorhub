<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <!-- Header -->
      <section
        class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c] sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Student</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to add a new student.
          </p>
        </div>
        <RouterLink
          to="/student"
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
        <form class="space-y-6" @submit.prevent="submit">
          <!-- Avatar row -->
          <div class="flex justify-center">
            <AvatarUploader :name="data.name" @pending-file="handlePendingFile" />
          </div>

          <!-- 4 fields in 2x2 grid -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model.trim="data.name"
                type="text"
                placeholder="Student name"
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                id="email"
                v-model.trim="data.email"
                type="email"
                placeholder="student@example.com"
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div class="space-y-2">
              <label for="phone" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Phone
              </label>
              <input
                id="phone"
                v-model.trim="data.phone"
                type="text"
                inputmode="numeric"
                placeholder="Phone number"
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div class="space-y-2">
              <label for="description" class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                v-model="data.description"
                rows="4"
                placeholder="Additional notes about the student..."
                class="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              ></textarea>
            </div>
          </div>

          <!-- Full-width submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Student</span>
          </button>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useStudentCreateForm } from '@/features/student/hooks/useStudentCreateForm';
import AvatarUploader from '@/components/AvatarUploader.vue';

const { data, submit, isSubmitting, handlePendingFile } = useStudentCreateForm();
</script>
