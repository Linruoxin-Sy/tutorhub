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

router.beforeEach((to) => {
  if (to.meta.publicRoute) {
    return;
  }
  const token = localStorage.getItem('token');
  if (token) {
    return;
  }
  return '/login';
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
