<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader
        title="Create Course"
        description="Fill in the details below to add a new course."
      />

      <!-- Form -->
      <CardSection class="p-6">
        <CourseForm v-model="data">
          <template #actions>
            <button
              :disabled="isSubmitting"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="submit"
            >
              <span v-if="isSubmitting">Creating...</span>
              <span v-else>Create Course</span>
            </button>
          </template>
        </CourseForm>
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useCourseCreateForm } from '@/features/course/hooks/useCourseCreateForm';
import CourseForm from '@/features/course/components/CourseForm.vue';

const { data, submit, isSubmitting } = useCourseCreateForm();
</script>
