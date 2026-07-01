import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import AppNavBar from '@/layouts/AppNavBar.vue';

function createMockRouter(initialRoute = '/dashboard') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: { template: '<div>Dashboard</div>' },
        meta: { navbarIndex: 0 },
      },
      {
        path: '/student',
        name: 'student.list',
        component: { template: '<div>Student</div>' },
        meta: { navbarIndex: 1 },
      },
      {
        path: '/course',
        name: 'course.list',
        component: { template: '<div>Course</div>' },
        meta: { navbarIndex: 2 },
      },
      {
        path: '/class-rule',
        name: 'class-rule.list',
        component: { template: '<div>Class Rule</div>' },
        meta: { navbarIndex: 3 },
      },
    ],
  });
  router.replace(initialRoute);
  return router;
}

test('renders all 4 navigation items', async () => {
  const router = createMockRouter();

  const screen = await render(AppNavBar, {
    global: { plugins: [router] },
  });

  await expect.element(screen.getByText('Dashboard')).toBeVisible();
  await expect.element(screen.getByText('Student')).toBeVisible();
  await expect.element(screen.getByText('Course')).toBeVisible();
  await expect.element(screen.getByText('Class Rule')).toBeVisible();
});

test('highlights active route', async () => {
  const router = createMockRouter('/student');

  const screen = await render(AppNavBar, {
    global: { plugins: [router] },
  });

  const studentLink = screen.getByText('Student').element().closest('a') as HTMLElement;
  expect(studentLink.className).toContain('bg-white');
  expect(studentLink.className).toContain('text-gray-900');
});

test('does not highlight inactive routes', async () => {
  const router = createMockRouter('/dashboard');

  const screen = await render(AppNavBar, {
    global: { plugins: [router] },
  });

  const studentLink = screen.getByText('Student').element().closest('a') as HTMLElement;
  expect(studentLink.className).toContain('text-gray-500');
});

test('navigates on click', async () => {
  const router = createMockRouter('/dashboard');

  const screen = await render(AppNavBar, {
    global: { plugins: [router] },
  });

  await screen.getByText('Student').click();
  await new Promise((r) => setTimeout(r, 100));
  expect(router.currentRoute.value.name).toBe('student.list');
});

test('has navigation landmark', async () => {
  const router = createMockRouter();

  const screen = await render(AppNavBar, {
    global: { plugins: [router] },
  });

  const nav = screen.getByRole('navigation');
  await expect.element(nav).toBeVisible();
});
