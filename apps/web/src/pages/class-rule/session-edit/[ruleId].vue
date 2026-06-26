<route lang="json">
{
  "name": "class-rule.session-edit"
}
</route>

<template>
  <ClassRuleSessionEditPage :rule-id="ruleId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleSessionEditPage from '@/features/class-rule/pages/class-rule-session-edit-page.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const ruleId = params.ruleId;
</script>
