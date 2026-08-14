import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import MobileNav from '@/layouts/MobileNav.vue';
import { i18n } from '@/locales';
import { resetI18nLocale } from '@/utils/test-utils';

function createMockRouter(initialRoute = '/dashboard') {
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
  router.replace(initialRoute);
  return router;
}

beforeEach(() => {
  resetI18nLocale('en');
  window.localStorage.clear();
});

test('is closed by default', async () => {
  const router = createMockRouter();

  const screen = await render(MobileNav, {
    global: { plugins: [i18n, router] },
  });

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('renders drawer content when open', async () => {
  const router = createMockRouter();

  const screen = await render(MobileNav, {
    props: { open: true },
    global: { plugins: [i18n, router] },
  });

  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await expect.element(screen.getByText('Dashboard')).toBeVisible();
  await expect.element(screen.getByText('Class Rule')).toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'Close menu' })).toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'EN', exact: true })).toBeVisible();
  await expect.element(screen.getByRole('button', { name: 'Follow system theme' })).toBeVisible();
});

test('closes on close button click', async () => {
  const router = createMockRouter();

  const screen = await render(MobileNav, {
    props: { open: true },
    global: { plugins: [i18n, router] },
  });

  await screen.getByRole('button', { name: 'Close menu' }).click();
  await new Promise((r) => setTimeout(r, 400));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('navigates and closes on nav link click', async () => {
  const router = createMockRouter();

  const screen = await render(MobileNav, {
    props: { open: true },
    global: { plugins: [i18n, router] },
  });

  await screen.getByText('Student').click();
  await new Promise((r) => setTimeout(r, 100));
  expect(router.currentRoute.value.name).toBe('student.list');
  await new Promise((r) => setTimeout(r, 400));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('closes on Escape key', async () => {
  const router = createMockRouter();

  const screen = await render(MobileNav, {
    props: { open: true },
    global: { plugins: [i18n, router] },
  });

  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await new Promise((r) => setTimeout(r, 400));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('closes when route changes', async () => {
  const router = createMockRouter();

  const screen = await render(MobileNav, {
    props: { open: true },
    global: { plugins: [i18n, router] },
  });

  await router.push({ name: 'course.list' });
  await new Promise((r) => setTimeout(r, 400));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});
