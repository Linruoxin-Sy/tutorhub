import type { Ref } from 'vue';
import { ref, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';
import { enqueue } from '@/hooks/useAnimationQueue';

export function useElementInView(elRef: Ref<HTMLElement | null>) {
  const isVisible = ref(false);

  const targetIsVisible = useElementVisibility(elRef);

  watch(targetIsVisible, (visible) => {
    if (visible && !isVisible.value) {
      enqueue(() => {
        isVisible.value = true;
      });
    }
  });

  return { isVisible };
}
