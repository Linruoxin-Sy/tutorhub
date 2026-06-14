<route lang="json">
{
  "name": "student.list",
  "path": "/student",
  "meta": {
    "navbarIndex": 1
  }
}
</route>

<template>
  <StudentListPage />
</template>

<script setup lang="ts">
import StudentListPage from '@/features/student/pages/student-list-page.vue';
</script>
