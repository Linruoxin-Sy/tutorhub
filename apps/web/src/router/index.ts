import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    ...routes,
  ],
});

/** 尝试用 Refresh Token Cookie 静默获取新 Access Token */
async function trySilentRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { accessToken?: string };
    return body.accessToken ?? null;
  } catch {
    return null;
  }
}

router.beforeEach(async (to) => {
  if (to.meta.publicRoute) {
    return;
  }

  const token = localStorage.getItem('accessToken');

  // 没有 Access Token 但可能仍有 Refresh Token Cookie → 尝试静默刷新
  if (!token) {
    const newToken = await trySilentRefresh();
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
      return;
    }
    return { name: 'auth.login' };
  }

  return;
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
