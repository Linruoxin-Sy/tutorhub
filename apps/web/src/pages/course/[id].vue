<route lang="json">
{
  "name": "course.detail"
}
</route>

<template>
  <CourseDetailPage :id="id" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import CourseDetailPage from '@/features/course/pages/course-detail-page.vue';

const route = useRoute();
const id = (route.params as Record<string, string>).id;
</script>
