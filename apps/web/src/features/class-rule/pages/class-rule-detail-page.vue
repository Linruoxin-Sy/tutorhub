<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Class Rule Details"
      description="View generated sessions and overrides for this class rule."
    />

    <ListPageShell title="Sessions">
      <template #actions>
        <span
          v-if="overrides.length > 0"
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <i class="i-lucide-rotate-ccw size-3" />
          {{ overrides.length }} rescheduled
        </span>
      </template>

      <div class="flex min-h-0 flex-1 flex-col">
        <VirtualList
          :query="sessionQuery"
          :estimate-size="80"
          :overscan="10"
          scroll-class="flex-1 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #loading>
            <div class="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <LoadingIndicator text="Loading sessions..." />
            </div>
          </template>

          <template #item="{ item }">
            <SessionItem
              v-if="item"
              :student-name="studentName"
              :course-name="courseName"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
              :overridden-start-time="item.rescheduledStartTime"
              :overridden-end-time="item.rescheduledEndTime"
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
                No sessions to display.
              </div>
            </div>
          </template>
        </VirtualList>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RRule } from 'rrule';
import type { Options as RRuleOptions } from 'rrule';
import dayjs from 'dayjs';
import type { GeneratedSession } from '@tutorhub/schema';
import {
  fetchClassRuleById,
  fetchClassRuleOverrides,
} from '@/features/class-rule/api/class-rule-api';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

const props = defineProps<{
  ruleId: string;
}>();

const isLoading = ref(true);
const loadError = ref<string | null>(null);

const studentName = ref('Student');
const courseName = ref('Course');

/** 调课覆盖记录 */
const overrides = ref<Record<string, unknown>[]>([]);

/** 合并 overrides 后的 sessions */
const mergedSessions = ref<GeneratedSession[]>([]);

const sessionQuery = useLocalQuery(mergedSessions);

onMounted(async () => {
  try {
    const rule = await fetchClassRuleById(props.ruleId);

    // 提取学生和课程名称
    const sc = rule.studentCourse as Record<string, unknown> | undefined;
    const s = sc?.student as Record<string, unknown> | undefined;
    const c = sc?.course as Record<string, unknown> | undefined;
    studentName.value = (s?.name as string) ?? 'Student';
    courseName.value = (c?.name as string) ?? 'Course';

    // 获取 overrides
    const overridesData = await fetchClassRuleOverrides(props.ruleId);
    overrides.value = overridesData;

    // 生成 sessions
    const startDate = dayjs(rule.startDate as string).toDate();
    const intervalDays = rule.intervalDays as number | null;
    const endDate = rule.endDate ? dayjs(rule.endDate as string).toDate() : null;
    const startTime = dayjs(rule.startTime as string).format('HH:mm');
    const endTime = dayjs(rule.endTime as string).format('HH:mm');

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

      const ruleObj = new RRule(rruleOptions);

      if (endDate) {
        dates = ruleObj.between(startDate, endDate, true);
      } else {
        const maxDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        dates = ruleObj.between(startDate, maxDate, true);
      }
    }

    // 构建 override map
    const overrideMap = new Map<string, Record<string, unknown>>();
    for (const ov of overridesData) {
      const occDate = dayjs(ov.occurrenceDate as string).format('YYYY-MM-DD');
      overrideMap.set(occDate, ov);
    }

    mergedSessions.value = dates.map((d) => {
      const dateStr = dayjs(d).format('YYYY-MM-DD');
      const ov = overrideMap.get(dateStr);

      if (ov) {
        return {
          occurrenceDate: dateStr,
          startTime,
          endTime,
          overridden: true,
          rescheduledDate: ov.rescheduledDate
            ? dayjs(ov.rescheduledDate as string).format('YYYY-MM-DD')
            : null,
          rescheduledStartTime: ov.rescheduledStartTime
            ? dayjs(ov.rescheduledStartTime as string).format('HH:mm')
            : null,
          rescheduledEndTime: ov.rescheduledEndTime
            ? dayjs(ov.rescheduledEndTime as string).format('HH:mm')
            : null,
        };
      }

      return {
        occurrenceDate: dateStr,
        startTime,
        endTime,
      };
    });
  } catch {
    loadError.value = 'Failed to load class rule data';
  } finally {
    isLoading.value = false;
  }
});
</script>
