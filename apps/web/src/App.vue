<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<script setup lang="ts">
import { client } from '@/api';

const res = await client.index.$get();
const data = await res.json();
console.log(data.msg);
</script>
