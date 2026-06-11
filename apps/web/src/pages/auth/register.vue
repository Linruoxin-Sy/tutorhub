<route lang="json">
{
  "name": "auth.register",
  "path": "/register",
  "meta": {
    "hideAppHeader": true,
    "publicRoute": true
  }
}
</route>

<template>
  <RegisterPage />
</template>

<script setup lang="ts">
import RegisterPage from '@/features/auth/pages/register-page.vue';
</script>
