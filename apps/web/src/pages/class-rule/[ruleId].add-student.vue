<route lang="json">
{
  "name": "class-rule.add-student"
}
</route>

<template>
  <ClassRuleAddStudentPage :rule-id="ruleId" :course-id="courseId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleAddStudentPage from '@/features/class-rule/pages/class-rule-add-student-page.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const ruleId = params.ruleId;
const courseId = (route.query as Record<string, string>).courseId;
</script>
