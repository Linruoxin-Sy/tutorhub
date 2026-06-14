<route lang="json">
{
  "name": "course.list",
  "path": "/course",
  "meta": {
    "navbarIndex": 2
  }
}
</route>

<template>
  <CourseListPage />
</template>

<script setup lang="ts">
import CourseListPage from '@/features/course/pages/course-list-page.vue';
</script>
