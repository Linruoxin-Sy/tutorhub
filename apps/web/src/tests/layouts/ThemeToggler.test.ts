import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import ThemeToggler from '@/layouts/ThemeToggler.vue';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('renders three theme buttons', async () => {
  const screen = await render(ThemeToggler);

  await expect.element(screen.getByLabelText('跟随系统主题')).toBeVisible();
  await expect.element(screen.getByLabelText('亮色主题')).toBeVisible();
  await expect.element(screen.getByLabelText('暗色主题')).toBeVisible();
});

test('highlights system theme by default', async () => {
  const screen = await render(ThemeToggler);

  const systemBtn = screen.getByLabelText('跟随系统主题').element();
  expect(systemBtn.getAttribute('aria-pressed')).toBe('true');
});

test('switches to light theme on click', async () => {
  const screen = await render(ThemeToggler);

  await screen.getByLabelText('亮色主题').click();
  await new Promise((r) => setTimeout(r, 50));

  const lightBtn = screen.getByLabelText('亮色主题').element();
  expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
});

test('switches to dark theme on click', async () => {
  const screen = await render(ThemeToggler);

  await screen.getByLabelText('暗色主题').click();
  await new Promise((r) => setTimeout(r, 50));

  const darkBtn = screen.getByLabelText('暗色主题').element();
  expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
});
