<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Enrollment" description="This page has been moved." />

    <CardSection class="p-6 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Class rule management has been moved to the Course page.
      </p>
      <div class="mt-4">
        <AppButton @click="goToCourse">
          <i class="i-lucide-book-open size-4" />
          Go to Course
        </AppButton>
      </div>
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchEnrollmentById } from '@/features/enrollment/api/enrollment-api';

const route = useRoute();
const router = useRouter();
const id = (route.params as Record<string, string>).id;

onMounted(async () => {
  try {
    const enrollment = await fetchEnrollmentById(id);
    router.replace({ name: 'course.edit', params: { id: enrollment.courseId } });
  } catch {
    // stay on this page if enrollment not found
  }
});

function goToCourse() {
  const id = (route.params as Record<string, string>).id;
  router.push({ name: 'course.edit', params: { id } });
}
</script>
