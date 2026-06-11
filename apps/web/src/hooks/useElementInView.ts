import type { Ref } from 'vue';
import { ref, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';

export function useElementInView(elRef: Ref<HTMLElement | null>) {
  const isVisible = ref(false);

  const targetIsVisible = useElementVisibility(elRef);

  watch(targetIsVisible, () => {
    isVisible.value = true;
  });

  return { isVisible };
}
