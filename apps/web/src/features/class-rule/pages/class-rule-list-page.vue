<template>
  <main class="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="flex h-full flex-col gap-6">
      <ListPageShell title="Class Rules">
        <template #filters>
          <!-- 无筛选条件 -->
        </template>
        <template #actions>
          <!-- 无操作按钮 -->
        </template>

        <VirtualList
          :query="sparseQuery"
          :estimate-size="164"
          :overscan="5"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto p-5"
        >
          <template #loading>
            <div class="flex flex-col gap-5">
              <ClassRuleItem v-for="index in 4" :key="index" loading />
            </div>
          </template>

          <template #item="{ item, isLoaded }">
            <ClassRuleItem
              :rule="item!"
              :loading="!isLoaded"
              :actions="['edit', 'delete']"
              @view="router.push({ name: 'class-rule.detail', params: { ruleId: item!.id } })"
              @edit="
                router.push({
                  name: 'class-rule.edit',
                  params: { ruleId: item!.id },
                  query: { courseId: item!.courseId },
                })
              "
              @delete="handleDelete(item!)"
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
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchClassRules, deleteClassRule } from '@/features/class-rule/api/class-rule-api';
import { useDialog } from '@/hooks/useDialog';
import ClassRuleItem from '@/features/class-rule/components/ClassRuleItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import type { ClassRuleListItem } from '@tutorhub/schema';

const router = useRouter();
const queryClient = useQueryClient();
const { confirm } = useDialog();

const sparseQuery = useSparseQuery<ClassRuleListItem>({
  queryKeyPrefix: ['class-rules'],
  fetchFn: (params) => fetchClassRules(undefined, params as { offset?: number; limit?: number }),
});

async function handleDelete(item: ClassRuleListItem) {
  const confirmed = await confirm({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete this class rule for "${item.course?.name}"? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await deleteClassRule(item.id);
    toast.success('Class rule deleted successfully!');
    queryClient.invalidateQueries({ queryKey: ['class-rules'] });
  } catch {
    toast.error('Failed to delete class rule');
  }
}
</script>
