<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <PageHeader
        title="Class Rule Details"
        description="View generated sessions and overrides for this class rule."
      />

      <!-- 加载中 -->
      <CardSection v-if="isLoading" class="p-6">
        <LoadingIndicator text="Loading class rule data..." />
      </CardSection>

      <!-- 加载失败 -->
      <CardSection v-else-if="loadError" class="p-6">
        <div class="text-center text-sm text-red-500">{{ loadError }}</div>
      </CardSection>

      <!-- 底部卡片：生成的具体课程（含调课覆盖） -->
      <CardSection v-else-if="mergedSessions.length > 0" class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Sessions ({{ mergedSessions.length }})
          </h3>
          <span
            v-if="overrides.length > 0"
            class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >
            <i class="i-lucide-rotate-ccw size-3" />
            {{ overrides.length }} rescheduled
          </span>
        </div>

        <div
          ref="sessionListRef"
          class="flex max-h-96 [scrollbar-width:none] flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          @scroll="handleScroll"
        >
          <SessionItem
            v-for="session in displayedMergedSessions"
            :key="session.occurrenceDate"
            :student-name="studentName"
            :course-name="courseName"
            :date="session.occurrenceDate"
            :start-time="session.startTime"
            :end-time="session.endTime"
            :overridden-start-time="session.rescheduledStartTime"
            :overridden-end-time="session.rescheduledEndTime"
            :conflict="false"
          />
          <div
            v-if="hasMoreSessions"
            class="py-4 text-center text-sm text-gray-400 dark:text-gray-500"
          >
            Scroll down to load more sessions...
          </div>
        </div>
      </CardSection>

      <CardSection v-else class="p-6">
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          No sessions to display.
        </div>
      </CardSection>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { RRule } from 'rrule';
import type { Options as RRuleOptions } from 'rrule';
import dayjs from 'dayjs';
import type { GeneratedSession } from '@tutorhub/schema';
import {
  fetchClassRuleById,
  fetchClassRuleOverrides,
} from '@/features/class-rule/api/class-rule-api';
import SessionItem from '@/features/session/components/SessionItem.vue';

const props = defineProps<{
  ruleId: string;
  studentName?: string;
  courseName?: string;
}>();

const isLoading = ref(true);
const loadError = ref<string | null>(null);

const studentName = computed(() => props.studentName ?? 'Student');
const courseName = computed(() => props.courseName ?? 'Course');

/** 规则数据 */
const ruleData = ref<Record<string, unknown> | null>(null);

/** 调课覆盖记录 */
const overrides = ref<Record<string, unknown>[]>([]);

/** 生成的所有 sessions */
const generatedSessions = ref<GeneratedSession[]>([]);

/** 合并 overrides 后的 sessions */
const mergedSessions = ref<GeneratedSession[]>([]);

/** 当前显示的批次 */
const sessionBatchIndex = ref(0);
const BATCH_SIZE = 50;

const displayedMergedSessions = computed(() =>
  mergedSessions.value.slice(0, (sessionBatchIndex.value + 1) * BATCH_SIZE),
);

const hasMoreSessions = computed(
  () => displayedMergedSessions.value.length < mergedSessions.value.length,
);

onMounted(async () => {
  try {
    const rule = await fetchClassRuleById(props.ruleId);
    ruleData.value = rule;

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

    generatedSessions.value = dates.map((d) => {
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

    mergedSessions.value = generatedSessions.value;
  } catch {
    loadError.value = 'Failed to load class rule data';
  } finally {
    isLoading.value = false;
  }
});

// 虚拟滚动
const sessionListRef = ref<HTMLElement | null>(null);

function handleScroll(event: Event) {
  const el = event.target as HTMLElement;
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
    if (hasMoreSessions.value) {
      sessionBatchIndex.value++;
    }
  }
}
</script>
