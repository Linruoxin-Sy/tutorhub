import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/features/dashboard/pages/index.vue'),
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('@/features/student/pages/index.vue'),
    },
    {
      path: '/course',
      name: 'course',
      component: () => import('@/features/course/pages/index.vue'),
    },
    {
      path: '/session',
      name: 'session',
      component: () => import('@/features/session/pages/index.vue'),
    },
  ],
});

export default router;
