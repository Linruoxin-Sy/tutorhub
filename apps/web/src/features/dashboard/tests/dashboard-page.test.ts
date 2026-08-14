import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import DashboardPage from '@/features/dashboard/pages/dashboard-page.vue';
import { i18n } from '@/locales';
import { createTestQueryClient } from '@/utils/test-utils';

async function renderDashboardPage() {
  const queryClient = createTestQueryClient();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  });
  await router.replace('/dashboard');

  return render(DashboardPage, {
    global: {
      plugins: [i18n, router, createPinia(), [VueQueryPlugin, { queryClient }]],
      stubs: { SessionItem: true },
    },
  });
}

test('renders dashboard without crashing', async () => {
  const screen = await renderDashboardPage();

  // 确认组件渲染成功，标题存在
  await expect.element(screen.getByText('Recent sessions')).toBeVisible();
}, 15000);
