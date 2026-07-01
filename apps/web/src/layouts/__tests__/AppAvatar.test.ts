import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { useUserStore } from '@/features/auth/stores/user';

import AppAvatar from '../AppAvatar.vue';

beforeEach(() => {
  setActivePinia(createPinia());
});

async function renderWithSetup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'auth.login', component: { template: '<div>Login</div>' } },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  });
  await router.replace('/dashboard');

  return render(AppAvatar, {
    global: { plugins: [router, createPinia()] },
  });
}

test('renders avatar dropdown', async () => {
  const screen = await renderWithSetup();

  const avatarBtn = screen.getByRole('button');
  await expect.element(avatarBtn).toBeVisible();
});

test('shows logout option in dropdown', async () => {
  const screen = await renderWithSetup();

  await expect.element(screen.getByText('Logout')).toBeVisible();
});

test('calls logout and navigates to login on click', async () => {
  const screen = await renderWithSetup();
  const userStore = useUserStore();
  const logoutSpy = vi.spyOn(userStore, 'logout');

  await screen.getByText('Logout').click();

  expect(logoutSpy).toHaveBeenCalledOnce();
});
