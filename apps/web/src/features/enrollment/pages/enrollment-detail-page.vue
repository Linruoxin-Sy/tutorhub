<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Enrollment Details" description="Student course enrollment information." />

    <CardSection v-if="isLoading" class="p-6">
      <LoadingIndicator text="Loading enrollment..." />
    </CardSection>

    <CardSection v-else-if="enrollment" class="p-6">
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="space-y-1">
          <label
            class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
          >
            Student
          </label>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ enrollment.student.name }}
          </p>
        </div>
        <div class="space-y-1">
          <label
            class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
          >
            Course
          </label>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ enrollment.course.name }}
          </p>
        </div>
        <div class="space-y-1">
          <label
            class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
          >
            Enrolled At
          </label>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ formatDate(enrollment.createdAt) }}
          </p>
        </div>
      </div>
      <div
        class="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6 dark:border-[#343434]"
      >
        <AppButton @click="goToCourse">
          <i class="i-lucide-book-open size-4" />
          View Course
        </AppButton>
        <AppButton @click="goToStudent">
          <i class="i-lucide-user size-4" />
          View Student
        </AppButton>
      </div>
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchEnrollmentById } from '@/features/enrollment/api/enrollment-api';
import { formatDate } from '@/utils/date';
import type { EnrollmentDetailResponse } from '@tutorhub/schema';

const route = useRoute();
const router = useRouter();
const id = (route.params as Record<string, string>).id;

const isLoading = ref(true);
const enrollment = ref<EnrollmentDetailResponse | null>(null);

onMounted(async () => {
  try {
    enrollment.value = await fetchEnrollmentById(id);
  } catch {
    // handled by toast
  } finally {
    isLoading.value = false;
  }
});

function goToCourse() {
  if (enrollment.value) {
    router.push({ name: 'course.detail', params: { id: enrollment.value.courseId } });
  }
}

function goToStudent() {
  if (enrollment.value) {
    router.push({ name: 'student.detail', params: { id: enrollment.value.studentId } });
  }
}
</script>
