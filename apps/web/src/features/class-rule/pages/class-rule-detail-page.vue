<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Class Rule Details"
      description="View generated sessions for this class rule."
    />

    <ListPageShell title="Generated Sessions">
      <template #actions>
        <span v-if="courseName" class="text-sm text-gray-500 dark:text-gray-400">
          Course: {{ courseName }}
        </span>
        <span v-if="!isLoading" class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalSessions }} session(s)
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RRule, type Options as RRuleOptions } from 'rrule';
import type { GeneratedSession } from '@tutorhub/schema';
import { fetchClassRuleById } from '@/features/class-rule/api/class-rule-api';
import { fetchClassSessionOverrides } from '@/features/class-session/api/class-session-api';
import { useLocalQuery } from '@/hooks/useLocalQuery';
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
const sessionQuery = useLocalQuery(generatedSessions);
const totalSessions = ref(0);

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

onMounted(async () => {
  try {
    // 1. Fetch rule data
    const rule = await fetchClassRuleById(props.ruleId);
    const data = rule as Record<string, unknown>;
    courseName.value = ((data.course as Record<string, unknown>)?.name as string) ?? '';

    const startDateRaw = data.startDate as string;
    const startTimeRaw = data.startTime as string;
    const endTimeRaw = data.endTime as string;
    const intervalDays = (data.intervalDays as number) ?? null;
    const endDateRaw = data.endDate as string | null;

    const startDate = dayjs(startDateRaw).toDate();
    const endDate = endDateRaw ? dayjs(endDateRaw).toDate() : null;
    const startTime = dayjs(startTimeRaw).format('HH:mm');
    const endTime = dayjs(endTimeRaw).format('HH:mm');

    // 2. Fetch all override records
    const overrideResult = await fetchClassSessionOverrides({
      classRuleId: props.ruleId,
      limit: 9999,
    });

    // Build override map
    const cancelledDates = new Set<string>();
    const rescheduledMap = new Map<
      string,
      { rescheduledDate: string; startTime: string; endTime: string }
    >();

    for (const ov of overrideResult.items) {
      const dateKey = dayjs(ov.originalDate).format('YYYY-MM-DD');
      if (ov.state === 'CANCELLED') {
        cancelledDates.add(dateKey);
      } else if (ov.state === 'RESCHEDULED') {
        rescheduledMap.set(dateKey, {
          rescheduledDate: ov.rescheduledDate
            ? dayjs(ov.rescheduledDate).format('YYYY-MM-DD')
            : dateKey,
          startTime: ov.rescheduledStartTime
            ? dayjs(ov.rescheduledStartTime).format('HH:mm')
            : startTime,
          endTime: ov.rescheduledEndTime ? dayjs(ov.rescheduledEndTime).format('HH:mm') : endTime,
        });
      }
    }

    // 3. Generate sessions with rrule
    let dates: Date[];
    if (!intervalDays) {
      dates = [startDate];
    } else {
      const rruleOptions: Partial<RRuleOptions> = {
        freq: RRule.DAILY,
        interval: intervalDays,
        dtstart: new Date(
          Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
        ),
      };

      if (endDate) {
        rruleOptions.until = new Date(
          Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
        );
      }

      const rule = new RRule(rruleOptions);

      if (endDate) {
        dates = rule.between(startDate, endDate, true);
      } else {
        const maxDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        dates = rule.between(startDate, maxDate, true);
      }
    }

    // 4. Convert to GeneratedSession with status
    const sessions: GeneratedSession[] = [];
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const dateStr = dayjs(d).format('YYYY-MM-DD');

      // Check for cancelled override
      if (cancelledDates.has(dateStr)) {
        sessions.push({
          id: `session_detail_${props.ruleId}_${dateStr}_${i}`,
          occurrenceDate: dateStr,
          startTime,
          endTime,
          status: 'cancelled',
        });
        continue;
      }

      // Check for rescheduled override
      const rescheduled = rescheduledMap.get(dateStr);
      if (rescheduled) {
        sessions.push({
          id: `session_detail_${props.ruleId}_${dateStr}_${i}`,
          occurrenceDate: rescheduled.rescheduledDate,
          startTime: rescheduled.startTime,
          endTime: rescheduled.endTime,
          status: 'rescheduled',
          overridden: true,
          rescheduledDate: rescheduled.rescheduledDate,
          rescheduledStartTime: rescheduled.startTime,
          rescheduledEndTime: rescheduled.endTime,
        });
      } else {
        sessions.push({
          id: `session_detail_${props.ruleId}_${dateStr}_${i}`,
          occurrenceDate: dateStr,
          startTime,
          endTime,
          status: computeSessionStatus(dateStr, startTime, endTime),
        });
      }
    }

    generatedSessions.value = sessions;
    totalSessions.value = sessions.length;
  } catch {
    // Handled by empty state
  } finally {
    isLoading.value = false;
  }
});
</script>
