<route lang="json">
{
  "name": "class-rule.edit"
}
</route>

<template>
  <ClassRuleEditPage :course-id="courseId" :rule-id="ruleId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleEditPage from '@/features/class-rule/pages/class-rule-edit-page.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const ruleId = params.ruleId;
const courseId = (route.query as Record<string, string>).courseId;
</script>
