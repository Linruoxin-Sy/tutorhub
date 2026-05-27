<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <StatsSection />

      <section class="space-y-6">
        <AssistantSection />

        <RecentSessionsSection />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import AssistantSection from '@/features/dashboard/components/AssistantSection.vue';
import RecentSessionsSection from '@/features/dashboard/components/RecentSessionsSection.vue';
import StatsSection from '@/features/dashboard/components/StatsSection.vue';
</script>
