import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

type TransitionName = 'slide-left' | 'slide-right' | 'fade-scale';

export function usePageTransition() {
  const router = useRouter();
  const transitionName = ref<TransitionName>('fade-scale');

  let prevIndex: number | undefined;

  const unregister = router.afterEach((to) => {
    const fromIdx = prevIndex;
    const toIdx = to.meta?.navbarIndex as number | undefined;
    prevIndex = toIdx;

    if (fromIdx !== undefined && toIdx !== undefined) {
      transitionName.value = toIdx > fromIdx ? 'slide-left' : 'slide-right';
    } else {
      transitionName.value = 'fade-scale';
    }
  });

  onUnmounted(unregister);

  return { transitionName };
}
