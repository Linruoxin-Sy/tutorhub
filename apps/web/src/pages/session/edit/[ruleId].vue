<route lang="json">
{
  "name": "session.edit"
}
</route>

<template>
  <SessionEditPage :rule-id="ruleId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import SessionEditPage from '@/features/session/pages/session-edit-page.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const ruleId = params.ruleId;
</script>