<route lang="json">
{
  "path": "/login",
  "meta": {
    "hideAppHeader": true,
    "publicRoute": true
  }
}
</route>

<template>
  <LoginPage />
</template>

<script setup lang="ts">
import LoginPage from '@/features/auth/pages/login-page.vue';
</script>
