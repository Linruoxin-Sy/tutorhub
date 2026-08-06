import { beforeEach, expect, test } from 'vitest';

import LocaleToggler from '@/layouts/LocaleToggler.vue';
import { i18n } from '@/locales';
import { renderWithSetup, resetI18nLocale } from '@/utils/test-utils';

beforeEach(() => {
  resetI18nLocale('en');
  window.localStorage.clear();
});

test('renders EN and 中文 buttons', async () => {
  const screen = await renderWithSetup(LocaleToggler);

  await expect.element(screen.getByRole('button', { name: 'EN' })).toBeVisible();
  await expect.element(screen.getByRole('button', { name: '中文' })).toBeVisible();
});

test('defaults to en locale', async () => {
  await renderWithSetup(LocaleToggler);

  expect(i18n.global.locale.value).toBe('en');
});

test('switches to zh-CN on click and persists to localStorage', async () => {
  const screen = await renderWithSetup(LocaleToggler);

  await screen.getByRole('button', { name: '中文' }).click();
  await new Promise((r) => setTimeout(r, 50));

  expect(i18n.global.locale.value).toBe('zh-CN');
  expect(window.localStorage.getItem('locale')).toBe('zh-CN');
});
