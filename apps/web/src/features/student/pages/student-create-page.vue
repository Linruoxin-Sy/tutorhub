<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title-key="student.create.title" description-key="student.create.description" />

      <!-- Form -->
      <CardSection class="p-6">
        <StudentForm v-model="data" @avatar-change="handlePendingFile">
          <template #actions>
            <Transition
              mode="out-in"
              enter-active-class="transition duration-250"
              leave-active-class="transition duration-150"
              enter-from-class="opacity-0 scale-[0.92]"
              leave-to-class="opacity-0 scale-[0.92]"
            >
              <button
                v-if="isSubmitting"
                key="submitting"
                disabled
                class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
              >
                <T keypath="common.actions.creating" />
              </button>
              <button
                v-else
                key="create"
                class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                @click="submit"
              >
                <T keypath="common.actions.createStudent" />
              </button>
            </Transition>
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
