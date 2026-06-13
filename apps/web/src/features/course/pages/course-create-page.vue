<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader
        title="Create Course"
        description="Fill in the details below to add a new course."
      />

      <!-- Form -->
      <CardSection class="p-6">
        <form class="space-y-6" @submit.prevent="submit">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model.trim="data.name"
              type="text"
              placeholder="Course name"
              class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <div class="space-y-2">
            <label for="status" class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Status
            </label>
            <SelectInput id="status" v-model="data.status" size="md">
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </SelectInput>
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Description
            </label>
            <textarea
              id="description"
              v-model="data.description"
              rows="4"
              placeholder="Course description..."
              class="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
            ></textarea>
          </div>

          <!-- Full-width submit -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Course</span>
          </button>
        </form>
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useCourseCreateForm } from '@/features/course/hooks/useCourseCreateForm';

const { data, submit, isSubmitting } = useCourseCreateForm();
</script>
