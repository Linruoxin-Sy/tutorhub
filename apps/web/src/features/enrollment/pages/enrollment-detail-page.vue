<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Enrollment Details" description="View class rules for this enrollment." />

    <ListPageShell title="Class Rules">
      <div class="flex min-h-0 flex-1 flex-col">
        <VirtualList
          :query="sparseQuery"
          :estimate-size="160"
          :overscan="10"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto p-5"
        >
          <template #loading>
            <div class="divide-y divide-gray-200 dark:divide-[#343434]">
              <ClassRuleItem v-for="index in 6" :key="index" loading />
            </div>
          </template>

          <template #item="{ item, isLoaded }">
            <ClassRuleItem :rule="item!" :loading="!isLoaded" :actions="[]" />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              <div
                class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
              >
                No class rules found.
              </div>
            </div>
          </template>
        </VirtualList>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchClassRules } from '@/features/class-rule/api/class-rule-api';
import ClassRuleItem from '@/features/class-rule/components/ClassRuleItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import PageHeader from '@/components/PageHeader.vue';
import type { ClassRule } from '@tutorhub/database';

const route = useRoute();
const id = (route.params as Record<string, string>).id;

const sparseQuery = useSparseQuery<ClassRule>({
  queryKeyPrefix: ['class-rules', id],
  fetchFn: (params) => fetchClassRules(id, params),
});
</script>
