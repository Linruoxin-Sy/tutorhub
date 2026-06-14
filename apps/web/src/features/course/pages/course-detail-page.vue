<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader title="Course Details" description="View the full information of the course." />

      <CardSection v-if="isInitialLoading" class="p-6">
        <LoadingIndicator text="Loading course data..." />
      </CardSection>

      <!-- Detail content -->
      <CardSection v-else class="p-6">
        <CourseForm v-model="data" :created-at="createdAt" :updated-at="updatedAt" readonly />
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useCourseDetail } from '@/features/course/hooks/useCourseDetail';
import CourseForm from '@/features/course/components/CourseForm.vue';

const props = defineProps<{
  id: string;
}>();

const { data, createdAt, updatedAt, isInitialLoading } = useCourseDetail(props.id);
</script>
