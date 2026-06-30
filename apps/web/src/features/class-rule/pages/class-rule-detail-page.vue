<template>
  <main class="mx-auto flex min-h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Class Rule Details"
      description="View generated sessions for this class rule."
    />

    <!-- Read-only form -->
    <CardSection v-if="!isInitialLoading" class="shrink-0 p-6">
      <ClassRuleForm v-model="formData" readonly />
    </CardSection>

    <ListPageShell title="Sessions">
      <template #actions>
        <!-- empty -->
      </template>

      <div class="flex h-125 flex-col">
        <div
          v-if="isInitialLoading"
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
              :price="item.price"
              :original-price="item.originalPrice"
              :original-date="item.overridden ? item.overriddenDate : null"
              :original-start-time="item.overridden ? item.rescheduledStartTime : null"
              :original-end-time="item.overridden ? item.rescheduledEndTime : null"
              :actions="item.overridden ? ['restore'] : ['change']"
              @change="navigateToSessionEdit(item)"
              @restore="restoreSession(item)"
            />
          </template>
        </VirtualList>
      </div>
    </ListPageShell>

    <!-- Assigned Students -->
    <ListPageShell title="Assigned Students">
      <template #filters>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
          <SearchInput v-model="studentSearch" placeholder="Search students..." />

          <SelectInput v-model="studentStatus">
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </SelectInput>
        </div>
      </template>

      <div class="flex h-125 flex-col">
        <VirtualList
          :query="studentQuery"
          :estimate-size="70"
          :overscan="10"
          row-class="border-b border-gray-200 transition hover:bg-gray-50 dark:border-[#343434] dark:hover:bg-[#202020]"
          :row-style="{ display: 'flex' }"
        >
          <template #header>
            <div
              class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
              style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1fr 1.2fr 1fr"
            >
              <div
                v-for="column in studentColumns"
                :key="column"
                class="truncate px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
              >
                {{ column }}
              </div>
            </div>
          </template>

          <template #loading>
            <div class="divide-y divide-gray-200 dark:divide-[#343434]">
              <StudentItem v-for="index in 8" :key="index" loading />
            </div>
          </template>

          <template #item="{ item, isLoaded }">
            <StudentItem
              :student="item!.student"
              :loading="!isLoaded"
              :actions="[]"
              @view="router.push({ name: 'student.detail', params: { id: item!.student.id } })"
            />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              No students found.
            </div>
          </template>
        </VirtualList>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { cloneDeep } from 'es-toolkit';
import { computed, onMounted, ref } from 'vue';
import { refDebounced } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import { RRule, type Options as RRuleOptions } from 'rrule';
import type { GeneratedSession } from '@tutorhub/schema';
import { fetchClassRuleById } from '@/features/class-rule/api/class-rule-api';
import {
  deleteClassSessionOverride,
  fetchClassSessionOverrides,
} from '@/features/class-session/api/class-session-api';
import { useDialog } from '@/hooks/useDialog';
import { computeSessionStatus } from '@/features/session/utils/sessionStatus';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import StudentItem from '@/features/student/components/StudentItem.vue';
import ClassRuleForm from '@/features/class-rule/components/ClassRuleForm.vue';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchClassRuleStudents } from '@/features/class-rule/api/class-rule-api';
import type { ClassRuleStudentListResponse } from '@tutorhub/schema';
import {
  DEFAULT_FORM_DATA,
  type ClassRuleFormData,
} from '@/features/class-rule/types/classRuleForm';

const props = defineProps<{
  ruleId: string;
}>();

type ClassRuleStudentItem = ClassRuleStudentListResponse['items'][number];

const router = useRouter();
const isInitialLoading = ref(true);
const courseName = ref('');

// ---- Assigned Students ----

const studentColumns = ['Name', 'Email', 'Phone', 'Status', 'Created At', 'Actions'];

const studentSearch = ref('');
const debouncedStudentSearch = refDebounced(studentSearch, 300);
const studentSearchRef = computed(() => debouncedStudentSearch.value ?? '');

const studentStatus = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const studentStatusRef = computed(() => studentStatus.value ?? '');

const studentQuery = useSparseQuery<ClassRuleStudentItem>({
  queryKeyPrefix: ['class-rule-students', props.ruleId],
  fetchFn: (params) => fetchClassRuleStudents(props.ruleId, params),
  filters: { name: studentSearchRef, status: studentStatusRef },
});
const formData = ref<ClassRuleFormData>(cloneDeep(DEFAULT_FORM_DATA));

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
// startTime 的 UTC 小时/分钟（用于计算本地日期）
let startUtcHour = 0;
let startUtcMin = 0;
let rulePrice: number | null = null;

/** 将 UTC 日期 + 开始时间（UTC）转换为本地日期字符串 */
function getLocalDate(utcDate: Date): string {
  const dt = new Date(
    Date.UTC(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate(),
      startUtcHour,
      startUtcMin,
    ),
  );
  return dayjs(dt).format('YYYY-MM-DD');
}

// Override 映射（一次性获取）
const cancelledDates = new Set<string>();
const priceOverrideMap = new Map<string, number | null>();
const rescheduledMap = new Map<
  string,
  { rescheduledDate: string; startTime: string; endTime: string; priceOverride: number | null }
>();

function navigateToSessionEdit(session: GeneratedSession) {
  router.push({
    name: 'session.edit',
    params: { ruleId: props.ruleId },
    query: {
      date: session.occurrenceDate,
      startTime: session.startTime,
      endTime: session.endTime,
    },
  });
}

const { confirm } = useDialog();

async function restoreSession(session: GeneratedSession) {
  const ok = await confirm({
    title: 'Restore Session',
    message: `Restore the session on ${session.occurrenceDate} to its original time? The current override will be deleted permanently.`,
    confirmText: 'Restore',
    variant: 'danger',
  });
  if (!ok) return;

  try {
    // Find the override ID
    const sessionDate = session.overriddenDate || session.occurrenceDate;
    const overrideResult = await fetchClassSessionOverrides({
      classRuleId: props.ruleId,
      limit: 9999,
    });

    const matched = overrideResult.items.find((ov) => {
      const ovDate = dayjs(ov.originalDate).format('YYYY-MM-DD');
      return ovDate === sessionDate;
    });

    if (!matched) {
      toast.error('Override not found');
      return;
    }

    await deleteClassSessionOverride(matched.id);
    toast.success('Session restored to original time');

    // 重新加载页面数据
    await loadData();
  } catch {
    toast.error('Failed to restore session');
  }
}

/** 从开头重新生成所有 session（含单次和循环） */
function regenerateSessions() {
  generatedSessions.value = [];
  sessionWindowEnd.value = null;
  hasMoreRef.value = true;

  if (!ruleIntervalDays || !ruleStartDate) {
    // 单次上课
    if (!ruleStartDate) return;
    const singleDateStr = getLocalDate(ruleStartDate);

    const singlePrice = priceOverrideMap.get(singleDateStr) ?? rulePrice;
    if (cancelledDates.has(singleDateStr)) {
      generatedSessions.value.push({
        id: `session_detail_${props.ruleId}_${singleDateStr}_0`,
        occurrenceDate: singleDateStr,
        startTime: ruleStartTime,
        endTime: ruleEndTime,
        status: 'cancelled',
        overridden: true,
        price: singlePrice,
        originalPrice: rulePrice,
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
        overriddenDate: singleDateStr,
        price: rescheduled.priceOverride ?? rulePrice,
        originalPrice: rulePrice,
      });
    } else {
      generatedSessions.value.push({
        id: `session_detail_${props.ruleId}_${singleDateStr}_0`,
        occurrenceDate: singleDateStr,
        startTime: ruleStartTime,
        endTime: ruleEndTime,
        status: computeSessionStatus(singleDateStr, ruleStartTime, ruleEndTime),
        price: singlePrice,
        originalPrice: rulePrice,
      });
    }
    hasMoreRef.value = false;
  } else {
    appendSessionChunk();
  }
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
    const dateStr = getLocalDate(d);
    const ovPrice = priceOverrideMap.get(dateStr) ?? rulePrice;

    if (cancelledDates.has(dateStr)) {
      generatedSessions.value.push({
        id: `session_detail_${props.ruleId}_${dateStr}_${startIdx + i}`,
        occurrenceDate: dateStr,
        startTime: ruleStartTime,
        endTime: ruleEndTime,
        status: 'cancelled',
        overridden: true,
        price: ovPrice,
        originalPrice: rulePrice,
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
          overriddenDate: dateStr,
          price: rescheduled.priceOverride ?? rulePrice,
          originalPrice: rulePrice,
        });
      } else {
        generatedSessions.value.push({
          id: `session_detail_${props.ruleId}_${dateStr}_${startIdx + i}`,
          occurrenceDate: dateStr,
          startTime: ruleStartTime,
          endTime: ruleEndTime,
          status: computeSessionStatus(dateStr, ruleStartTime, ruleEndTime),
          price: ovPrice,
          originalPrice: rulePrice,
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

/** 加载所有数据（规则 + override + 生成 session） */
async function loadData() {
  isInitialLoading.value = true;
  generatedSessions.value = [];
  cancelledDates.clear();
  priceOverrideMap.clear();
  rescheduledMap.clear();

  try {
    // 1. Fetch rule data
    const rule = await fetchClassRuleById(props.ruleId);
    const data = rule as Record<string, unknown>;
    courseName.value = ((data.course as Record<string, unknown>)?.name as string) ?? '';
    formData.value = {
      name: (data.name as string) ?? '',
      price: (data.price as number | null) ?? null,
      startDate: dayjs(data.startDate as string).format('YYYY-MM-DD'),
      startTime: dayjs(data.startTime as string).format('HH:mm'),
      endTime: dayjs(data.endTime as string).format('HH:mm'),
      intervalDays: (data.intervalDays as number | null) ?? null,
      endDate: data.endDate ? dayjs(data.endDate as string).format('YYYY-MM-DD') : '',
    };

    rulePrice = (data.price as number | null) ?? null;
    ruleStartDate = dayjs(data.startDate as string).toDate();
    ruleEndDate = data.endDate ? dayjs(data.endDate as string).toDate() : null;
    ruleStartTime = dayjs(data.startTime as string).format('HH:mm');
    ruleEndTime = dayjs(data.endTime as string).format('HH:mm');
    ruleIntervalDays = (data.intervalDays as number) ?? null;
    {
      const st = new Date(data.startTime as string);
      startUtcHour = st.getUTCHours();
      startUtcMin = st.getUTCMinutes();
    }

    // 2. Fetch all override records
    const overrideResult = await fetchClassSessionOverrides({
      classRuleId: props.ruleId,
      limit: 9999,
    });

    for (const ov of overrideResult.items) {
      const ovDate = new Date(ov.originalDate);
      // 将 override 的 UTC 日期转为与 session 一致的本地日期
      const ovDt = new Date(
        Date.UTC(
          ovDate.getUTCFullYear(),
          ovDate.getUTCMonth(),
          ovDate.getUTCDate(),
          startUtcHour,
          startUtcMin,
        ),
      );
      const dateKey = dayjs(ovDt).format('YYYY-MM-DD');
      const ovPrice = ov.priceOverride != null ? Number(ov.priceOverride) : null;
      priceOverrideMap.set(dateKey, ovPrice);
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
          priceOverride: ovPrice,
        });
      }
    }

    // 3. 生成第一页 session
    regenerateSessions();
  } catch {
    // Handled by empty state
  } finally {
    isInitialLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
