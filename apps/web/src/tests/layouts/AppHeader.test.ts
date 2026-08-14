import { page } from '@vitest/browser/context';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import AppHeader from '@/layouts/AppHeader.vue';
import { i18n } from '@/locales';

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
    global: { plugins: [i18n, router, createPinia()] },
  });

  await expect.element(screen.getByText('TutorHub')).toBeVisible();
});

test('renders navigation bar', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [i18n, router, createPinia()] },
  });

  await expect.element(screen.getByText('Dashboard')).toBeVisible();
  await expect.element(screen.getByText('Student')).toBeVisible();
  await expect.element(screen.getByText('Course')).toBeVisible();
  await expect.element(screen.getByText('Class Rule')).toBeVisible();
});

test('renders theme toggler', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [i18n, router, createPinia()] },
  });

  await expect.element(screen.getByLabelText('Follow system theme')).toBeVisible();
  await expect.element(screen.getByLabelText('Light theme')).toBeVisible();
  await expect.element(screen.getByLabelText('Dark theme')).toBeVisible();
});

test('renders logout button', async () => {
  const router = createMockRouter();

  const screen = await render(AppHeader, {
    global: { plugins: [i18n, router, createPinia()] },
  });

  await expect.element(screen.getByText('Logout')).toBeVisible();
});

test('renders menu toggle button on mobile viewport', async () => {
  await page.viewport(390, 844);
  try {
    const router = createMockRouter();

    const screen = await render(AppHeader, {
      global: { plugins: [i18n, router, createPinia()] },
    });

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    await expect.element(toggle).toBeVisible();
    expect(toggle.element().getAttribute('aria-expanded')).toBe('false');
    expect(toggle.element().getAttribute('aria-controls')).toBe('mobile-nav-drawer');
  } finally {
    await page.viewport(1280, 720);
  }
});

test('opens mobile drawer from header menu toggle', async () => {
  await page.viewport(390, 844);
  try {
    const router = createMockRouter();

    const screen = await render(AppHeader, {
      global: { plugins: [i18n, router, createPinia()] },
    });

    await screen.getByRole('button', { name: 'Open menu' }).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Close menu' })).toBeVisible();
  } finally {
    await page.viewport(1280, 720);
  }
});
