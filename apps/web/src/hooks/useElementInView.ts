import { useElementVisibility } from '@vueuse/core';
import { ref, watch, type Ref } from 'vue';

export function useElementInView(elRef: Ref<HTMLElement | null>) {
  const isVisible = ref(false);

  const targetIsVisible = useElementVisibility(elRef);

  watch(targetIsVisible, () => {
    isVisible.value = true;
  });

  return { isVisible };
}
