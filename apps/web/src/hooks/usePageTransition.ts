import { ref, watch } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

type TransitionName = 'slide-left' | 'slide-right' | 'nav-up' | 'nav-down' | 'fade-scale';

const STYLE_ID = '__page-transition-styles';

export function usePageTransition(route: RouteLocationNormalizedLoaded) {
  const transitionName = ref<TransitionName>('fade-scale');

  injectStylesOnce();

  watch(
    () => [route.name, (route.meta as Record<string, unknown>)?.navbarIndex] as const,
    ([, newIdx], [, oldIdx]) => {
      const fromIdx = oldIdx as number | undefined;
      const toIdx = newIdx as number | undefined;

      if (fromIdx !== undefined && toIdx !== undefined) {
        // 两者都是 Navbar 页面 → 根据索引比较决定方向
        transitionName.value = toIdx > fromIdx ? 'slide-left' : 'slide-right';
      } else if (fromIdx === undefined && toIdx === undefined) {
        // 两者都不是 Navbar 页面 → 缩放淡入淡出
        transitionName.value = 'fade-scale';
      } else if (fromIdx !== undefined && toIdx === undefined) {
        // Navbar → Fullscreen → 向上展开
        transitionName.value = 'nav-up';
      } else {
        // Fullscreen → Navbar → 向下收起
        transitionName.value = 'nav-down';
      }
    },
  );

  return { transitionName };
}

function injectStylesOnce() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* ── Navbar ↔ Navbar: 左右滑动 ── */
.slide-left-leave-active,
.slide-left-enter-active,
.slide-right-leave-active,
.slide-right-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* ── 非 Navbar ↔ 非 Navbar: 缩放淡入淡出 ── */
.fade-scale-leave-active,
.fade-scale-enter-active {
  transition: all 0.2s ease;
}
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}

/* ── Navbar → Fullscreen: 向上展开 ── */
.nav-up-leave-active,
.nav-up-enter-active {
  transition: all 0.25s ease;
}
.nav-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.nav-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.nav-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.nav-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* ── Fullscreen → Navbar: 向下收起 ── */
.nav-down-leave-active,
.nav-down-enter-active {
  transition: all 0.25s ease;
}
.nav-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.nav-down-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.nav-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.nav-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
`;
  document.head.appendChild(style);
}
