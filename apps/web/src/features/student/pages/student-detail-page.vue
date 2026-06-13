<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Student Details" description="View the student's information below." />

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
