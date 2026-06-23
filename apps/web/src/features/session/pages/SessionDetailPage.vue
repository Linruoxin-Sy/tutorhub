<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Session Details" description="View and manage this class session." />

    <CardSection v-if="isLoading" class="p-6">
      <LoadingIndicator text="Loading session data..." />
    </CardSection>

    <template v-else-if="session">
      <CardSection class="p-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              >Course</label
            >
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ session.course.name }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              >Date</label
            >
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatDate(session.occurrenceDate) }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              >Time</label
            >
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatTime(session.startTime) }} – {{ formatTime(session.endTime) }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              >Status</label
            >
            <p class="text-sm font-medium" :class="statusClass">{{ statusLabel }}</p>
          </div>
          <div v-if="session.room" class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              >Room</label
            >
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.room }}</p>
          </div>
          <div v-if="session.reason" class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              >Reason</label
            >
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.reason }}</p>
          </div>
        </div>
      </CardSection>

      <!-- 参与者列表 -->
      <ListPageShell title="Participants">
        <div class="flex flex-col p-5">
          <div
            v-if="participants.length === 0"
            class="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            No participants for this session.
          </div>
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="p in participants"
              :key="p.id"
              class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-[#3a3a3a]"
            >
              <div
                class="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {{ p.student.name.charAt(0) }}
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                p.student.name
              }}</span>
            </div>
          </div>
        </div>
      </ListPageShell>

      <!-- 操作按钮 -->
      <CardSection class="p-6">
        <div class="flex flex-wrap gap-3">
          <AppButton :disabled="isSubmitting" @click="handleReschedule">
            <i class="i-lucide-rotate-ccw size-4" />
            Reschedule
          </AppButton>
          <AppButton :disabled="isSubmitting" variant="secondary" @click="handleLeave">
            <i class="i-lucide-user-minus size-4" />
            Mark Leave
          </AppButton>
          <AppButton :disabled="isSubmitting" variant="secondary" @click="handleComplete">
            <i class="i-lucide-check-circle size-4" />
            Mark Completed
          </AppButton>
          <AppButton :disabled="isSubmitting" variant="danger" @click="handleCancel">
            <i class="i-lucide-x-circle size-4" />
            Cancel Session
          </AppButton>
        </div>
      </CardSection>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import {
  fetchClassSessionById,
  updateClassSession,
} from '@/features/class-session/api/class-session-api';
import { useLoading } from '@/hooks/useLoading';
import { formatDate, formatTime } from '@/utils/date';
import type { ClassSessionDetailResponse } from '@tutorhub/schema';

const props = defineProps<{ sessionId: string }>();
const router = useRouter();

const isLoading = ref(true);
const session = ref<ClassSessionDetailResponse | null>(null);
const participants = computed(() => session.value?.participants ?? []);

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    LEAVE: 'Leave',
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
  };
  return map[session.value?.state ?? ''] ?? session.value?.state ?? '';
});

const statusClass = computed(() => {
  const map: Record<string, string> = {
    SCHEDULED: 'text-blue-600 dark:text-blue-400',
    COMPLETED: 'text-green-600 dark:text-green-400',
    LEAVE: 'text-amber-600 dark:text-amber-400',
    CANCELLED: 'text-red-600 dark:text-red-400',
    RESCHEDULED: 'text-purple-600 dark:text-purple-400',
  };
  return map[session.value?.state ?? ''] ?? '';
});

onMounted(async () => {
  try {
    session.value = await fetchClassSessionById(props.sessionId);
  } catch {
    toast.error('Failed to load session');
    router.back();
  } finally {
    isLoading.value = false;
  }
});

const { withLoading, isLoadingRef: isSubmitting } = useLoading();

const handleReschedule = withLoading(async () => {
  // TODO: 打开调课对话框（修改日期/时间）
  toast.info('Reschedule feature coming soon');
});

const handleLeave = withLoading(async () => {
  await updateClassSession(props.sessionId, { state: 'LEAVE', reason: 'Student leave' });
  toast.success('Marked as leave');
  session.value = await fetchClassSessionById(props.sessionId);
});

const handleComplete = withLoading(async () => {
  await updateClassSession(props.sessionId, { state: 'COMPLETED' });
  toast.success('Marked as completed');
  session.value = await fetchClassSessionById(props.sessionId);
});

const handleCancel = withLoading(async () => {
  await updateClassSession(props.sessionId, { state: 'CANCELLED', reason: 'Session cancelled' });
  toast.success('Session cancelled');
  session.value = await fetchClassSessionById(props.sessionId);
});
</script>
