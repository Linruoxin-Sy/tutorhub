<template>
  <CardSection class="flex flex-1 flex-col overflow-hidden">
    <div class="shrink-0 border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
        </div>
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <slot name="filters" />
          <slot name="actions" />
        </div>
      </div>
    </div>
    <slot />
  </CardSection>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
