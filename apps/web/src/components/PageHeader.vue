<template>
  <section
    class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
  >
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-[#3a3a3a] dark:bg-transparent dark:text-gray-300 dark:hover:bg-[#202020]"
      @click="goBack"
    >
      <i class="i-lucide-arrow-left size-4"></i>
      Back
    </button>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();

const router = useRouter();

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'dashboard' });
  }
}
</script>
