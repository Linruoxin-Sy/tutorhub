<template>
  <dialog ref="dialogRef" class="modal" @close="handleCancel">
    <div
      class="modal-box rounded-2xl border border-gray-200 dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        {{ state.title }}
      </h3>
      <p class="py-4 text-sm text-gray-600 dark:text-gray-300">
        {{ state.message }}
      </p>
      <div class="modal-action">
        <button
          class="btn btn-ghost btn-sm rounded-lg text-sm"
          :disabled="state.loading"
          @click="handleCancel"
        >
          {{ state.cancelText }}
        </button>
        <button
          class="btn btn-sm rounded-lg text-sm"
          :class="confirmBtnClass"
          :disabled="state.loading"
          @click="handleConfirm"
        >
          <span v-if="state.loading" class="loading loading-spinner loading-xs" />
          {{ state.confirmText }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { useDialog } from '@/hooks/useDialog';

const { state, resolveDialog } = useDialog();
const dialogRef = ref<HTMLDialogElement>();

const confirmBtnClass = computed(() => (state.variant === 'danger' ? 'btn-error' : 'btn-primary'));

watch(
  () => state.visible,
  (visible) => {
    if (visible) {
      dialogRef.value?.showModal();
    } else {
      dialogRef.value?.close();
    }
  },
);

function handleConfirm() {
  resolveDialog(true);
}

function handleCancel() {
  resolveDialog(false);
}
</script>
