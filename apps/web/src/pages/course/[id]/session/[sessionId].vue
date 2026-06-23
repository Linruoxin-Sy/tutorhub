<route lang="json">
{
  "name": "course.session.detail"
}
</route>

<template>
  <SessionDetailPage :session-id="sessionId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import SessionDetailPage from '@/features/session/pages/SessionDetailPage.vue';

const route = useRoute();
const params = route.params as Record<string, string>;
const sessionId = params.sessionId;
</script>
