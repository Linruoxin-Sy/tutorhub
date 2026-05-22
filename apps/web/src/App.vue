<template>
  <h1>{{ msgData }}</h1>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { client } from '@/utils';

const msgData = ref<string>('');
const init = async () => {
  const res = await client.index.$get();
  const data = await res.json();
  msgData.value = data.msg;
};
init();
</script>
