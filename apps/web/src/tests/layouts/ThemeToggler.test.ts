import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import ThemeToggler from '@/layouts/ThemeToggler.vue';
import { i18n } from '@/locales';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('renders three theme buttons', async () => {
  const screen = await render(ThemeToggler, { global: { plugins: [i18n] } });

  await expect.element(screen.getByLabelText('Follow system theme')).toBeVisible();
  await expect.element(screen.getByLabelText('Light theme')).toBeVisible();
  await expect.element(screen.getByLabelText('Dark theme')).toBeVisible();
});

test('highlights system theme by default', async () => {
  const screen = await render(ThemeToggler, { global: { plugins: [i18n] } });

  const systemBtn = screen.getByLabelText('Follow system theme').element();
  expect(systemBtn.getAttribute('aria-pressed')).toBe('true');
});

test('switches to light theme on click', async () => {
  const screen = await render(ThemeToggler, { global: { plugins: [i18n] } });

  await screen.getByLabelText('Light theme').click();
  await new Promise((r) => setTimeout(r, 50));

  const lightBtn = screen.getByLabelText('Light theme').element();
  expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
});

test('switches to dark theme on click', async () => {
  const screen = await render(ThemeToggler, { global: { plugins: [i18n] } });

  await screen.getByLabelText('Dark theme').click();
  await new Promise((r) => setTimeout(r, 50));

  const darkBtn = screen.getByLabelText('Dark theme').element();
  expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
});
