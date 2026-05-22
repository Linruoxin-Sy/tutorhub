<template>
  <h1>{{ data.msg }}</h1>
</template>

<script setup lang="ts">
import { client } from '@/utils';

const res = await client.index.$get();
const data = await res.json();
</script>
