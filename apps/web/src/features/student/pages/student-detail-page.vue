<template>
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <!-- Header -->
      <section
        class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Student Details</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View the student's information below.
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

      <!-- Loading state -->
      <section
        v-if="isLoading"
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
        <div class="space-y-6">
          <!-- Avatar row -->
          <div class="flex justify-center">
            <div
              class="size-24 overflow-hidden rounded-full border-2 border-gray-200 shadow-sm dark:border-[#4a4a4a]"
            >
              <img
                v-if="student.avatarUrl"
                :src="student.avatarUrl"
                class="size-full rounded-full object-cover"
                alt="Avatar"
              />
              <div
                v-else
                class="flex size-full items-center justify-center rounded-full text-xl font-bold"
                :style="{
                  background: getAvatarGradient(student.name),
                  color: getAvatarTextColor(student.name),
                }"
              >
                {{ student.name.charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>

          <!-- 4 fields in 2x2 grid -->
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Name </label>
              <p
                class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
              >
                {{ student.name }}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Email </label>
              <p
                class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
              >
                {{ student.email || '-' }}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200"> Phone </label>
              <p
                class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
              >
                {{ student.phone || '-' }}
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Created At
              </label>
              <p
                class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
              >
                {{ formatDateTime(student.createdAt) }}
              </p>
            </div>
          </div>

          <!-- Full-width description -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
              Description
            </label>
            <p
              class="min-h-[3rem] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              {{ student.description || '-' }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { fetchStudentById } from '@/features/student/api/student-api';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';
import { formatDateTime } from '@/utils/date';
import type { StudentDetailResponse } from '@/features/student/api/student-api';

const route = useRoute();
const router = useRouter();
const id = (route.params as Record<string, string>).id;

const isLoading = ref(true);
const student = ref<StudentDetailResponse | null>(null);

onMounted(async () => {
  try {
    student.value = await fetchStudentById(id);
  } catch {
    toast.error('Failed to load student data');
    router.push({ name: 'student.list' });
  } finally {
    isLoading.value = false;
  }
});
</script>
