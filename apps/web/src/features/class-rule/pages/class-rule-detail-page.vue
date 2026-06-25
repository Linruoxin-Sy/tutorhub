<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Class Rule Details"
      description="View session overrides for this class rule."
    />

    <ListPageShell title="Session Overrides">
      <template #actions>
        <span v-if="courseName" class="text-sm text-gray-500 dark:text-gray-400">
          Course: {{ courseName }}
        </span>
      </template>

      <div class="flex min-h-0 flex-1 flex-col">
        <VirtualList
          v-if="!isLoading"
          :query="sessionQuery"
          :estimate-size="90"
          :overscan="10"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #item="{ item }">
            <SessionItem
              v-if="item"
              :course-name="courseName || 'Course'"
              :date="formatDate(item.originalDate)"
              :start-time="item.rescheduledStartTime ? formatTime(item.rescheduledStartTime) : '-'"
              :end-time="item.rescheduledEndTime ? formatTime(item.rescheduledEndTime) : '-'"
              :overridden-start-time="null"
              :overridden-end-time="null"
              :conflict="false"
            />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              <div
                class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
              >
                No session overrides to display.
              </div>
            </div>
          </template>
        </VirtualList>

        <div
          v-if="isLoading"
          class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <LoadingIndicator text="Loading session overrides..." />
        </div>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ClassSessionOverrideListItem } from '@tutorhub/schema';
import { fetchClassRuleById } from '@/features/class-rule/api/class-rule-api';
import { fetchClassSessionOverrides } from '@/features/class-session/api/class-session-api';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { formatDate, formatTime } from '@/utils/date';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

const props = defineProps<{
  ruleId: string;
}>();

const isLoading = ref(true);
const courseName = ref('');

const rule = ref<Record<string, unknown> | null>(null);
const sessions = ref<ClassSessionOverrideListItem[]>([]);
const sessionQuery = useLocalQuery(sessions);

onMounted(async () => {
  try {
    rule.value = await fetchClassRuleById(props.ruleId);
    courseName.value =
      (((rule.value as Record<string, unknown>)?.course as Record<string, unknown>)
        ?.name as string) ?? '';

    const result = await fetchClassSessionOverrides({
      classRuleId: props.ruleId,
      limit: 200,
    });
    sessions.value = result.items;
  } catch {
    // handled by empty state
  } finally {
    isLoading.value = false;
  }
});
</script>
