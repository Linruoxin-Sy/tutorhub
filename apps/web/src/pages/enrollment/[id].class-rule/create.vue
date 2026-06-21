<route lang="json">
{
  "name": "enrollment.class-rule.create"
}
</route>

<template>
  <ClassRuleCreatePage :enrollment-id="id" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ClassRuleCreatePage from '@/features/class-rule/pages/class-rule-create-page.vue';

const route = useRoute();
const id = (route.params as Record<string, string>).id;
</script>
