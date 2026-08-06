<template>
  <Transition name="locale-swap" mode="out-in">
    <span :key="locale" class="inline-block">
      <template v-if="keypath">{{ t(keypath, params) }}</template>
      <slot v-else />
    </span>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { MessageKey } from '@/locales';

withDefaults(
  defineProps<{
    /** 翻译 keypath，例如 'common.confirm'；不传则渲染默认 slot 内容 */
    keypath?: MessageKey;
    /** 传给 t(keypath, params) 的插值参数 */
    params?: Record<string, unknown>;
  }>(),
  { keypath: '', params: () => ({}) },
);

const { t, locale } = useI18n();
</script>

<style scoped>
.locale-swap-enter-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.locale-swap-leave-active {
  transition: opacity 0.1s ease;
}
.locale-swap-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.locale-swap-leave-to {
  opacity: 0;
}
</style>
