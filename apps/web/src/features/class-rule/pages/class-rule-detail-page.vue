<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Class Rule Details"
      description="View generated sessions for this class rule."
    />

    <ListPageShell title="Sessions">
      <template #actions>
        <span v-if="courseName" class="text-sm text-gray-500 dark:text-gray-400">
          Course: {{ courseName }}
        </span>
      </template>

      <div class="flex min-h-0 flex-1 flex-col">
        <div
          v-if="isLoading"
          class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <LoadingIndicator text="Loading class rule data..." />
        </div>

        <div
          v-else-if="generatedSessions.length === 0"
          class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
        >
          <div
            class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
          >
            No sessions to display for this rule.
          </div>
        </div>

        <VirtualList
          v-else
          :query="sessionQuery"
          :estimate-size="90"
          :overscan="10"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #item="{ item }">
            <SessionItem
              v-if="item"
              :course-name="courseName || 'Course'"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
              :status="item.status"
              :overridden-start-time="item.overridden ? item.rescheduledStartTime : null"
              :overridden-end-time="item.overridden ? item.rescheduledEndTime : null"
              :actions="['change']"
              @change="navigateToSessionEdit(item)"
            />
          </template>
        </VirtualList>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RRule, type Options as RRuleOptions } from 'rrule';
import type { GeneratedSession } from '@tutorhub/schema';
import { fetchClassRuleById } from '@/features/class-rule/api/class-rule-api';
import { fetchClassSessionOverrides } from '@/features/class-session/api/class-session-api';
import { computeSessionStatus } from '@/features/session/utils/sessionStatus';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

const props = defineProps<{
  ruleId: string;
}>();

const router = useRouter();
const isLoading = ref(true);
const courseName = ref('');
const generatedSessions = ref<GeneratedSession[]>([]);
const sessionWindowEnd = ref<Date | null>(null);
const hasMoreRef = ref(false);
const CHUNK_DAYS = 365;

// 规则参数（从 API 获取后缓存）
let ruleStartDate: Date | null = null;
let ruleEndDate: Date | null = null;
let ruleStartTime = '';
let ruleEndTime = '';
let ruleIntervalDays: number | null = null;

// Override 映射（一次性获取）
const cancelledDates = new Set<string>();
const rescheduledMap = new Map<
  string,
  { rescheduledDate: string; startTime: string; endTime: string }
>();

function navigateToSessionEdit(session: GeneratedSession) {
  router.push({
    name: 'class-rule.session-edit',
    params: { ruleId: props.ruleId },
    query: {
      date: session.occurrenceDate,
      startTime: session.startTime,
      endTime: session.endTime,
    },
  });
}

/** 追加下一批 session */
function appendSessionChunk() {
  if (!ruleStartDate || !ruleIntervalDays) return;

  const rruleOptions: Partial<RRuleOptions> = {
    freq: RRule.DAILY,
    interval: ruleIntervalDays,
    dtstart: new Date(ruleStartDate.toISOString().slice(0, 10) + 'T00:00:00.000Z'),
  };

  if (ruleEndDate) {
    rruleOptions.until = new Date(ruleEndDate.toISOString().slice(0, 10) + 'T00:00:00.000Z');
  }

  const rule = new RRule(rruleOptions);

  const prevEnd = sessionWindowEnd.value ?? new Date(ruleStartDate.getTime() - 24 * 60 * 60 * 1000);
  const nextDay = new Date(prevEnd.getTime() + 24 * 60 * 60 * 1000);

  let newWindowEnd: Date;
  if (ruleEndDate) {
    const candidate = new Date(prevEnd.getTime() + CHUNK_DAYS * 24 * 60 * 60 * 1000);
    newWindowEnd = candidate > ruleEndDate ? ruleEndDate : candidate;
  } else {
    newWindowEnd = new Date(prevEnd.getTime() + CHUNK_DAYS * 24 * 60 * 60 * 1000);
  }

  const newDates = rule.between(nextDay, newWindowEnd, true);
  const startIdx = generatedSessions.value.length;

  for (let i = 0; i < newDates.length; i++) {
    const d = newDates[i];
    const dateStr = d.toISOString().slice(0, 10);

    if (cancelledDates.has(dateStr)) {
      generatedSessions.value.push({
        id: `session_detail_${props.ruleId}_${dateStr}_${startIdx + i}`,
        occurrenceDate: dateStr,
        startTime: ruleStartTime,
        endTime: ruleEndTime,
        status: 'cancelled',
      });
    } else {
      const rescheduled = rescheduledMap.get(dateStr);
      if (rescheduled) {
        generatedSessions.value.push({
          id: `session_detail_${props.ruleId}_${dateStr}_${startIdx + i}`,
          occurrenceDate: rescheduled.rescheduledDate,
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          status: 'rescheduled',
          overridden: true,
          rescheduledDate: rescheduled.rescheduledDate,
          rescheduledStartTime: rescheduled.startTime,
          rescheduledEndTime: rescheduled.endTime,
        });
      } else {
        generatedSessions.value.push({
          id: `session_detail_${props.ruleId}_${dateStr}_${startIdx + i}`,
          occurrenceDate: dateStr,
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          status: computeSessionStatus(dateStr, ruleStartTime, ruleEndTime),
        });
      }
    }
  }

  sessionWindowEnd.value = newWindowEnd;

  if (ruleEndDate && newWindowEnd >= ruleEndDate) {
    hasMoreRef.value = false;
  }
}

/** 暴露给 VirtualList 的 query（ensureRange 自动追加） */
const sessionQuery = {
  getItem: (index: number): GeneratedSession | undefined => generatedSessions.value[index],
  isLoaded: () => true,
  total: computed(() => generatedSessions.value.length),
  isLoading: false,
  error: '',
  ensureRange: async (_start: number, end: number) => {
    if (end >= generatedSessions.value.length - 1 && hasMoreRef.value) {
      appendSessionChunk();
    }
  },
};

onMounted(async () => {
  try {
    // 1. Fetch rule data
    const rule = await fetchClassRuleById(props.ruleId);
    const data = rule as Record<string, unknown>;
    courseName.value = ((data.course as Record<string, unknown>)?.name as string) ?? '';

    ruleStartDate = dayjs(data.startDate as string).toDate();
    ruleEndDate = data.endDate ? dayjs(data.endDate as string).toDate() : null;
    ruleStartTime = dayjs(data.startTime as string).format('HH:mm');
    ruleEndTime = dayjs(data.endTime as string).format('HH:mm');
    ruleIntervalDays = (data.intervalDays as number) ?? null;

    // 2. Fetch all override records
    const overrideResult = await fetchClassSessionOverrides({
      classRuleId: props.ruleId,
      limit: 9999,
    });

    for (const ov of overrideResult.items) {
      const ovDate = new Date(ov.originalDate);
      const dateKey = ovDate.toISOString().slice(0, 10);
      if (ov.state === 'CANCELLED') {
        cancelledDates.add(dateKey);
      } else if (ov.state === 'RESCHEDULED') {
        rescheduledMap.set(dateKey, {
          rescheduledDate: ov.rescheduledDate
            ? new Date(ov.rescheduledDate).toISOString().slice(0, 10)
            : dateKey,
          startTime: ov.rescheduledStartTime
            ? dayjs(ov.rescheduledStartTime).format('HH:mm')
            : ruleStartTime,
          endTime: ov.rescheduledEndTime
            ? dayjs(ov.rescheduledEndTime).format('HH:mm')
            : ruleEndTime,
        });
      }
    }

    // 3. 生成第一页 session
    if (!ruleIntervalDays) {
      // 单次上课
      const singleDateStr = ruleStartDate.toISOString().slice(0, 10);

      if (cancelledDates.has(singleDateStr)) {
        generatedSessions.value.push({
          id: `session_detail_${props.ruleId}_${singleDateStr}_0`,
          occurrenceDate: singleDateStr,
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          status: 'cancelled',
        });
      } else if (rescheduledMap.has(singleDateStr)) {
        const rescheduled = rescheduledMap.get(singleDateStr)!;
        generatedSessions.value.push({
          id: `session_detail_${props.ruleId}_${singleDateStr}_0`,
          occurrenceDate: rescheduled.rescheduledDate,
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          status: 'rescheduled',
          overridden: true,
          rescheduledDate: rescheduled.rescheduledDate,
          rescheduledStartTime: rescheduled.startTime,
          rescheduledEndTime: rescheduled.endTime,
        });
      } else {
        generatedSessions.value.push({
          id: `session_detail_${props.ruleId}_${singleDateStr}_0`,
          occurrenceDate: singleDateStr,
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          status: computeSessionStatus(singleDateStr, ruleStartTime, ruleEndTime),
        });
      }
      hasMoreRef.value = false;
    } else {
      hasMoreRef.value = true;
      appendSessionChunk();
    }
  } catch {
    // Handled by empty state
  } finally {
    isLoading.value = false;
  }
});
</script>
