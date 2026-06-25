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
            <Transition name="btn-phase" mode="out-in">
              <button
                v-if="isSubmitting"
                key="submitting"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white opacity-70"
              >
                Creating...
              </button>
              <button
                v-else
                key="create"
                class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="submit"
              >
                Create Student
              </button>
            </Transition>
          </template>
        </StudentForm>
      </CardSection>
    </div>
  </main>
</template>

<style scoped>
.btn-phase-enter-active {
  transition: all 0.25s ease-out;
}
.btn-phase-leave-active {
  transition: all 0.15s ease-in;
}
.btn-phase-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.btn-phase-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>

<script setup lang="ts">
import { useStudentCreateForm } from '@/features/student/hooks/useStudentCreateForm';
import StudentForm from '@/features/student/components/StudentForm.vue';

const { data, submit, isSubmitting, handlePendingFile } = useStudentCreateForm();
</script>
