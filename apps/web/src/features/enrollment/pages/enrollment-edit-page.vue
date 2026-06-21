<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Edit Enrollment" description="Manage class rules for this enrollment." />

    <ListPageShell title="Class Rules">
      <template #actions>
        <AppButton @click="handleCreateRule">
          <i class="i-lucide-plus size-4" />
          <span>Add Rule</span>
        </AppButton>
      </template>

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
            <ClassRuleItem
              :rule="item!"
              :loading="!isLoaded"
              :actions="['edit', 'delete']"
              @view="handleViewRule(item!)"
              @edit="handleEditRule(item!)"
              @delete="handleDeleteRule(item!)"
            />
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
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchClassRules, deleteClassRule } from '@/features/class-rule/api/class-rule-api';
import ClassRuleItem from '@/features/class-rule/components/ClassRuleItem.vue';
import { useDialog } from '@/hooks/useDialog';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import PageHeader from '@/components/PageHeader.vue';
import AppButton from '@/components/AppButton.vue';
import type { ClassRuleListItem } from '@tutorhub/schema';

const route = useRoute();
const router = useRouter();
const id = (route.params as Record<string, string>).id;

const queryClient = useQueryClient();
const { confirm } = useDialog();

const sparseQuery = useSparseQuery<ClassRuleListItem>({
  queryKeyPrefix: ['class-rules', id],
  fetchFn: (params) => fetchClassRules(id, params),
});

function handleCreateRule() {
  router.push({ name: 'enrollment.class-rule.create', params: { id } });
}

function handleViewRule(rule: ClassRuleListItem) {
  router.push({
    name: 'enrollment.class-rule.detail',
    params: { id, ruleId: rule.id },
  });
}

function handleEditRule(rule: ClassRuleListItem) {
  router.push({
    name: 'enrollment.class-rule.edit',
    params: { id, ruleId: rule.id },
  });
}

async function handleDeleteRule(rule: ClassRuleListItem) {
  const confirmed = await confirm({
    title: 'Delete Class Rule',
    message: 'Are you sure you want to delete this class rule?',
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteClassRule(rule.id);
    toast.success('Class rule deleted successfully!');
    queryClient.invalidateQueries({ queryKey: ['class-rules', id] });
  } catch {
    toast.error('Failed to delete class rule');
  }
}
</script>
