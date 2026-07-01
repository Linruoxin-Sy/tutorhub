import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';

function createMockRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'dashboard', component: { template: '<div>Dashboard</div>' } }],
  });
  return router;
}

test('renders default slot content', async () => {
  const router = createMockRouter();
  await router.replace('/');

  const screen = await render(AppLayout, {
    slots: { default: () => 'Page Content' },
    global: {
      plugins: [router],
      stubs: {
        AppHeader: true,
        RouterView: true,
      },
    },
  });

  await expect.element(screen.getByText('Page Content')).toBeVisible();
});

test('has full-screen layout classes', async () => {
  const router = createMockRouter();
  await router.replace('/');

  const screen = await render(AppLayout, {
    slots: { default: () => 'Content' },
    global: {
      plugins: [router],
      stubs: {
        AppHeader: true,
        RouterView: true,
      },
    },
  });

  const root = screen.getByText('Content').element().closest('[class*="h-screen"]') as HTMLElement;
  expect(root).toBeDefined();
  expect(root.className).toContain('h-screen');
});
