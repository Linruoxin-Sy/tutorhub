<template>
  <CardSection class="flex flex-1 flex-col overflow-hidden">
    <div
      class="shrink-0 border-b border-gray-200 px-5 py-4 transition-colors dark:border-[#343434]"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            v-if="title || titleKey"
            class="text-2xl font-bold text-gray-900 transition-colors dark:text-white"
          >
            <T v-if="titleKey" :keypath="titleKey" :params="titleParams" />
            <template v-else>{{ title }}</template>
          </h1>
          <p
            v-if="description || descriptionKey"
            class="mt-1 text-sm text-gray-500 transition-colors dark:text-gray-400"
          >
            <T v-if="descriptionKey" :keypath="descriptionKey" :params="descriptionParams" />
            <template v-else>{{ description }}</template>
          </p>
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
import type { MessageKey } from '@/locales';

defineProps<{
  title?: string;
  titleKey?: MessageKey;
  titleParams?: Record<string, unknown>;
  description?: string;
  descriptionKey?: MessageKey;
  descriptionParams?: Record<string, unknown>;
}>();
</script>
