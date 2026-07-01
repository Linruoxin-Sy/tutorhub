import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import LoginPage from '@/features/auth/pages/login-page.vue';
import { createTestQueryClient } from '@/utils/test-utils';

beforeEach(() => {
  setActivePinia(createPinia());
});

async function renderLoginPage() {
  const queryClient = createTestQueryClient();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/login',
        name: 'auth.login',
        component: { template: '<div>Login</div>' },
        meta: { publicRoute: true },
      },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/register', name: 'auth.register', component: { template: '<div>Register</div>' } },
    ],
  });
  await router.replace('/login');

  return render(LoginPage, {
    global: {
      plugins: [router, createPinia(), [VueQueryPlugin, { queryClient }]],
    },
  });
}

test('renders sign in heading', async () => {
  const screen = await renderLoginPage();

  await expect.element(screen.getByText('Sign in to TutorHub')).toBeVisible();
});

test('renders welcome back text', async () => {
  const screen = await renderLoginPage();

  await expect.element(screen.getByText('Welcome back')).toBeVisible();
});

test('renders email/phone input field', async () => {
  const screen = await renderLoginPage();

  const input = screen.getByPlaceholder('Enter your email or phone number');
  await expect.element(input).toBeVisible();
});

test('renders password input field', async () => {
  const screen = await renderLoginPage();

  const input = screen.getByPlaceholder('Enter your password');
  await expect.element(input).toBeVisible();
});

test('renders sign in button', async () => {
  const screen = await renderLoginPage();

  await expect.element(screen.getByText('Sign in', { exact: true })).toBeVisible();
});

test('renders register link', async () => {
  const screen = await renderLoginPage();

  await expect.element(screen.getByText('Create one')).toBeVisible();
});

test('renders "No account yet?" prompt', async () => {
  const screen = await renderLoginPage();

  await expect.element(screen.getByText('No account yet?')).toBeVisible();
});
