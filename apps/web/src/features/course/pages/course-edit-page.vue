<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Edit Course" description="Update the course information below." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading course data..." />
      </CardSection>

      <!-- Form -->
      <CardSection v-else class="p-6">
        <form class="space-y-6" @submit.prevent="submit">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model.trim="formData.name"
              type="text"
              placeholder="Course name"
              class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <div class="space-y-2">
            <label for="status" class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Status
            </label>
            <SelectInput id="status" v-model="formData.status" size="md">
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
              v-model="formData.description"
              rows="4"
              placeholder="Course description..."
              class="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
            ></textarea>
          </div>

          <!-- Full-width submit -->
          <button
            type="submit"
            :disabled="isSubmitting || !hasChanged"
            class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span v-if="isSubmitting">Saving...</span>
            <span v-else-if="!hasChanged">No changes</span>
            <span v-else>Save Changes</span>
          </button>
        </form>
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useCourseEditForm } from '@/features/course/hooks/useCourseEditForm';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const { formData, hasChanged, isInitialLoading, submit, isSubmitting } = useCourseEditForm(id);
</script>
