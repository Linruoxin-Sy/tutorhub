import { getEnv } from '@/utils';
import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';

const router = createRouter({
  history: createWebHistory(getEnv('BASE_URL')),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    ...routes,
  ],
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
