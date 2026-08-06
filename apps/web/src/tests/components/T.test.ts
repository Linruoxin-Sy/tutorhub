import { beforeEach, expect, test } from 'vitest';

import T from '@/components/T.vue';
import type { MessageKey } from '@/locales';
import { renderWithSetup, resetI18nLocale } from '@/utils/test-utils';

beforeEach(() => {
  resetI18nLocale('en');
});

test('renders translated text by keypath', async () => {
  const screen = await renderWithSetup(T, { props: { keypath: 'common.actions.confirm' } });

  await expect.element(screen.getByText('Confirm')).toBeVisible();
});

test('renders params interpolation', async () => {
  const screen = await renderWithSetup(T, {
    props: { keypath: 'errors.requestFailed', params: { status: 500 } },
  });

  await expect.element(screen.getByText('Request failed (500)')).toBeVisible();
});

test('renders slot content when no keypath', async () => {
  const screen = await renderWithSetup(T, { slots: { default: () => 'custom text' } });

  await expect.element(screen.getByText('custom text')).toBeVisible();
});

test('updates text when locale changes', async () => {
  const screen = await renderWithSetup(T, { props: { keypath: 'common.actions.confirm' } });
  await expect.element(screen.getByText('Confirm')).toBeVisible();

  resetI18nLocale('zh-CN');
  await expect.element(screen.getByText('确认')).toBeVisible();
});

test('falls back gracefully for unknown keys', async () => {
  resetI18nLocale('zh-CN');
  const screen = await renderWithSetup(T, {
    props: { keypath: 'nonexistent.key' as unknown as MessageKey },
  });

  // missingWarn: false → 直接返回 key 本身，不抛错
  await expect.element(screen.getByText('nonexistent.key')).toBeVisible();
});
