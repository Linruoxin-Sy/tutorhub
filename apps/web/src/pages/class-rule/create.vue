<route lang="json">
{
  "name": "class-rule.create"
}
</route>

<template>
  <ClassRuleCreatePage :course-id="courseId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleCreatePage from '@/features/class-rule/pages/class-rule-create-page.vue';

const route = useRoute();
const courseId = (route.query as Record<string, string>).courseId;
</script>
