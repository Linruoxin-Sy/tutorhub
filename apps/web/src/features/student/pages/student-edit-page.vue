<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Edit Student" description="Update the student's information below." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading student data..." />
      </CardSection>

      <!-- Form -->
      <CardSection v-else class="p-6">
        <StudentForm
          v-model="formData"
          :avatar-url="currentAvatarUrl"
          @avatar-change="handlePendingFile"
        >
          <template #actions>
            <button
              :disabled="isSubmitting || !hasChanged"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="submit"
            >
              <span v-if="isSubmitting">Saving...</span>
              <span v-else-if="!hasChanged">No changes</span>
              <span v-else>Save Changes</span>
            </button>
          </template>
        </StudentForm>
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useStudentEditForm } from '@/features/student/hooks/useStudentEditForm';
import StudentForm from '@/features/student/components/StudentForm.vue';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const {
  formData,
  currentAvatarUrl,
  hasChanged,
  isInitialLoading,
  submit,
  isSubmitting,
  handlePendingFile,
} = useStudentEditForm(id);
</script>
