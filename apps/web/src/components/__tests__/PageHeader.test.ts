import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import PageHeader from '../PageHeader.vue';

// Mock useRouter
const mockBack = vi.fn();
const mockPush = vi.fn();

function createMockRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
      { path: '/test', name: 'test', component: { template: '<div>Test</div>' } },
    ],
  });
}

test('renders title', async () => {
  const router = createMockRouter();
  const screen = await render(PageHeader, {
    props: { title: 'Test Page' },
    global: { plugins: [router] },
  });

  await expect.element(screen.getByText('Test Page')).toBeVisible();
});

test('renders description when provided', async () => {
  const router = createMockRouter();
  const screen = await render(PageHeader, {
    props: { title: 'Test Page', description: 'This is a test page' },
    global: { plugins: [router] },
  });

  await expect.element(screen.getByText('This is a test page')).toBeVisible();
});

test('does not render description when not provided', async () => {
  const router = createMockRouter();
  const screen = await render(PageHeader, {
    props: { title: 'Test Page' },
    global: { plugins: [router] },
  });

  await expect.element(screen.getByText('Test Page')).toBeVisible();
  const section = screen.getByText('Test Page').element().closest('section') as HTMLElement;
  const allParagraphs = section.querySelectorAll('p');
  expect(allParagraphs.length).toBe(0);
});

test('renders Back button', async () => {
  const router = createMockRouter();
  const screen = await render(PageHeader, {
    props: { title: 'Test Page' },
    global: { plugins: [router] },
  });

  await expect.element(screen.getByText('Back')).toBeVisible();
});

test('calls router.back() on Back button click when history exists', async () => {
  vi.spyOn(History.prototype, 'length', 'get').mockReturnValue(2);

  const router = createMockRouter();
  vi.spyOn(router, 'back').mockImplementation(mockBack);

  const screen = await render(PageHeader, {
    props: { title: 'Test Page' },
    global: { plugins: [router] },
  });

  await screen.getByText('Back').click();
  expect(mockBack).toHaveBeenCalledOnce();
});

test('calls router.push(dashboard) when no history', async () => {
  vi.spyOn(History.prototype, 'length', 'get').mockReturnValue(1);

  const router = createMockRouter();
  vi.spyOn(router, 'push').mockImplementation(mockPush);

  const screen = await render(PageHeader, {
    props: { title: 'Test Page' },
    global: { plugins: [router] },
  });

  await screen.getByText('Back').click();
  expect(mockPush).toHaveBeenCalledWith({ name: 'dashboard' });
});
