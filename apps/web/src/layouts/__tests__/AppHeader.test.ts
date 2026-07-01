import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import AppHeader from '../AppHeader.vue';

beforeEach(() => {
  setActivePinia(createPinia());
});

function createMockRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/student', name: 'student.list', component: { template: '<div>Student</div>' } },
      { path: '/course', name: 'course.list', component: { template: '<div>Course</div>' } },
      {
        path: '/class-rule',
        name: 'class-rule.list',
        component: { template: '<div>Class Rule</div>' },
      },
    ],
  });
  return router;
}

test('renders TutorHub branding', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [router, createPinia()] },
  });

  await expect.element(screen.getByText('TutorHub')).toBeVisible();
});

test('renders navigation bar', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [router, createPinia()] },
  });

  await expect.element(screen.getByText('Dashboard')).toBeVisible();
  await expect.element(screen.getByText('Student')).toBeVisible();
  await expect.element(screen.getByText('Course')).toBeVisible();
  await expect.element(screen.getByText('Class Rule')).toBeVisible();
});

test('renders theme toggler', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [router, createPinia()] },
  });

  await expect.element(screen.getByLabelText('跟随系统主题')).toBeVisible();
  await expect.element(screen.getByLabelText('亮色主题')).toBeVisible();
  await expect.element(screen.getByLabelText('暗色主题')).toBeVisible();
});

test('renders logout button', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [router, createPinia()] },
  });

  await expect.element(screen.getByText('Logout')).toBeVisible();
});
