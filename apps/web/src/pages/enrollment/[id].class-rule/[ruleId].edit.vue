<route lang="json">
{
  "name": "enrollment.class-rule.edit"
}
</route>

<template>
  <ClassRuleEditPage :enrollment-id="id" :rule-id="ruleId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleEditPage from '@/features/class-rule/pages/class-rule-edit-page.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const id = params.id;
const ruleId = params.ruleId;
</script>
