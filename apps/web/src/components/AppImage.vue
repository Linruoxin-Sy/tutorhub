<template>
  <img :src="src" :alt="alt" class="h-full w-full bg-cover bg-no-repeat bg-center object-cover" />
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string;
  alt?: string;
}>();

const src = computed(() => {
  if (props.src.startsWith('http') || props.src.startsWith('data:')) {
    return props.src;
  } else {
    return import.meta.env.VITE_ASSETS_URL + props.src;
  }
});
</script>
