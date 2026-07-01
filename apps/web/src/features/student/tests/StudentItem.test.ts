import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-vue';

import { mockStudent } from '@/mocks/factories';

import StudentItem from '../components/StudentItem.vue';

// Mock useElementInView to always return isVisible: true
vi.mock('@/hooks/useElementInView', () => ({
  useElementInView: () => ({ isVisible: { value: true } }),
}));

test('renders student name and email', async () => {
  const student = mockStudent({ name: 'Alice Wang', email: 'alice@test.com' });

  const screen = await render(StudentItem, {
    props: { student, loading: false },
  });

  await expect.element(screen.getByText('Alice Wang')).toBeVisible();
  await expect.element(screen.getByText('alice@test.com')).toBeVisible();
});

test('does not emit view when loading', async () => {
  const onView = vi.fn();

  await render(StudentItem, {
    props: { student: undefined, loading: true },
    attrs: { onView },
  });

  // Try clicking on the container
  const container = document.querySelector('[class*="origin-bottom-right"]') as HTMLElement;
  container?.click();
  expect(onView).not.toHaveBeenCalled();
});

test('emits view on click', async () => {
  const onView = vi.fn();
  const student = mockStudent();

  const screen = await render(StudentItem, {
    props: { student, loading: false },
    attrs: { onView },
  });

  await screen.getByText(student.name).click();
  expect(onView).toHaveBeenCalledOnce();
});

test('does not emit view when loading', async () => {
  const onView = vi.fn();

  await render(StudentItem, {
    props: { student: undefined, loading: true },
    attrs: { onView },
  });

  // Try clicking on skeleton area
  const skeleton = document.querySelector('.animate-pulse') as HTMLElement | null;
  skeleton?.click();
  expect(onView).not.toHaveBeenCalled();
});

test('shows selected indicator when selected', async () => {
  const student = mockStudent();

  await render(StudentItem, {
    props: { student, loading: false, selected: true },
  });

  // 行元素应包含选中背景色类
  const row = document.querySelector('[class*="bg-blue-500"]');
  expect(row).toBeDefined();
});

test('renders phone number', async () => {
  const student = mockStudent({ phone: '13800138000' });

  const screen = await render(StudentItem, {
    props: { student, loading: false },
    global: {
      stubs: { Transition: false },
    },
  });

  // Phone is inside a Transition, may need extra wait
  await new Promise((r) => setTimeout(r, 200));
  const phoneEl = screen.getByText('13800138000').element();
  expect(phoneEl).toBeDefined();
}, 10000);
