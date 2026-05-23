<template>
  <img :src="src" :alt="alt" class="h-full w-full bg-cover bg-no-repeat bg-center object-cover" />
</template>

<script setup lang="ts">
import { getEnv } from '@/utils';

const props = defineProps<{
  src: string;
  alt?: string;
}>();

const src = computed(() => {
  if (props.src.startsWith('http') || props.src.startsWith('data:')) {
    return props.src;
  } else {
    return getEnv('ASSETS_URL') + props.src;
  }
});
</script>
