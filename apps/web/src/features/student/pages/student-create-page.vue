<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader
        title="Create Student"
        description="Fill in the details below to add a new student."
      />

      <!-- Form -->
      <CardSection class="p-6">
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
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useStudentCreateForm } from '@/features/student/hooks/useStudentCreateForm';
import StudentForm from '@/features/student/components/StudentForm.vue';

const { data, submit, isSubmitting, handlePendingFile } = useStudentCreateForm();
</script>
