<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title-key="session.detail.title" description-key="session.detail.description" />

    <CardSection v-if="isLoading" class="p-6">
      <LoadingIndicator :text="t('common.loading.session')" />
    </CardSection>

    <template v-else-if="session">
      <CardSection class="p-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              ><T keypath="common.labels.originalDate"
            /></label>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ formatDate(session.originalDate) }}
            </p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              ><T keypath="common.labels.status"
            /></label>
            <p class="text-sm font-medium" :class="statusClass">{{ statusLabel }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              ><T keypath="common.labels.price"
            /></label>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              <template v-if="session.priceOverride != null">
                {{ n(Number(session.priceOverride), 'currency') }}
              </template>
              <template v-else>—</template>
            </p>
          </div>
          <div v-if="session.reason" class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400"
              ><T keypath="common.labels.reason"
            /></label>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.reason }}</p>
          </div>
        </div>
      </CardSection>

      <!-- 操作按钮 -->
      <CardSection class="p-6">
        <div class="flex flex-wrap gap-3">
          <AppButton :disabled="isSubmitting" @click="handleReschedule">
            <i class="i-lucide-rotate-ccw size-4" />
            <T keypath="common.actions.reschedule" />
          </AppButton>
          <AppButton :disabled="isSubmitting" variant="danger" @click="handleCancel">
            <i class="i-lucide-x-circle size-4" />
            <T keypath="common.actions.cancelSession" />
          </AppButton>
        </div>
      </CardSection>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import {
  fetchClassSessionOverrideById,
  updateClassSessionOverride,
} from '@/features/class-session/api/class-session-api';
import { useLoading } from '@/hooks/useLoading';
import { i18n, type MessageKey } from '@/locales';
import { formatDate } from '@/utils/date';
import type { ClassSessionOverrideDetailResponse } from '@tutorhub/schema';

const props = defineProps<{ sessionId: string }>();
const router = useRouter();

const { t, n } = useI18n();
const isLoading = ref(true);
const session = ref<ClassSessionOverrideDetailResponse | null>(null);

const statusLabel = computed(() => {
  const map: Record<string, MessageKey> = {
    CANCELLED: 'session.status.cancelled',
    RESCHEDULED: 'session.status.rescheduled',
  };
  const key = map[session.value?.state ?? ''];
  return key ? t(key) : (session.value?.state ?? '');
});

const statusClass = computed(() => {
  const map: Record<string, string> = {
    CANCELLED: 'text-red-600 dark:text-red-400',
    RESCHEDULED: 'text-purple-600 dark:text-purple-400',
  };
  return map[session.value?.state ?? ''] ?? '';
});

onMounted(async () => {
  try {
    session.value = await fetchClassSessionOverrideById(props.sessionId);
  } catch {
    toast.error(i18n.global.t('session.detail.loadError'));
    router.back();
  } finally {
    isLoading.value = false;
  }
});

const { withLoading, isLoadingRef: isSubmitting } = useLoading();

const handleReschedule = withLoading(async () => {
  // TODO: 打开调课对话框（修改日期/时间）
  toast.info(i18n.global.t('session.detail.rescheduleComingSoon'));
});

const handleCancel = withLoading(async () => {
  await updateClassSessionOverride(props.sessionId, {
    state: 'CANCELLED',
    reason: i18n.global.t('session.detail.cancelledReason'),
  });
  toast.success(i18n.global.t('session.detail.cancelSuccess'));
  session.value = await fetchClassSessionOverrideById(props.sessionId);
});
</script>
