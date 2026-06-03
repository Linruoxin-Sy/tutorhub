<template>
  <img :src="src" :alt="alt" class="h-full w-full bg-cover bg-no-repeat bg-center object-cover" />
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  alt?: string;
}>();
</script>
