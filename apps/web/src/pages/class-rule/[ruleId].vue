<route lang="json">
{
  "name": "class-rule.detail"
}
</route>

<template>
  <ClassRuleDetailPage :rule-id="ruleId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleDetailPage from '@/features/class-rule/pages/class-rule-detail-page.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const ruleId = params.ruleId;
</script>
