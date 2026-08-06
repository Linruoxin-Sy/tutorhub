import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import SearchInput from '@/components/SearchInput.vue';
import { i18n } from '@/locales';

test('renders with default placeholder', async () => {
  const screen = await render(SearchInput, {
    props: { modelValue: '' },
    global: { plugins: [i18n] },
  });

  const input = screen.getByPlaceholder('Search...');
  await expect.element(input).toBeVisible();
});

test('renders with custom placeholder', async () => {
  const screen = await render(SearchInput, {
    props: { modelValue: '', placeholder: 'Find students...' },
    global: { plugins: [i18n] },
  });

  const input = screen.getByPlaceholder('Find students...');
  await expect.element(input).toBeVisible();
});

test('renders search icon', async () => {
  const screen = await render(SearchInput, {
    props: { modelValue: '' },
    global: { plugins: [i18n] },
  });

  const container = screen.getByPlaceholder('Search...').element().parentElement as HTMLElement;
  const icon = container.querySelector('.i-lucide-search');
  expect(icon).toBeDefined();
});

test('renders with sm size class', async () => {
  const screen = await render(SearchInput, {
    props: { modelValue: '', size: 'sm' },
    global: { plugins: [i18n] },
  });

  const outer = screen.getByPlaceholder('Search...').element().parentElement
    ?.parentElement as HTMLElement;
  expect(outer.className).toContain('sm:max-w-xs');
});

test('renders with md size (no sm size constraints)', async () => {
  const screen = await render(SearchInput, {
    props: { modelValue: '', size: 'md' },
    global: { plugins: [i18n] },
  });

  const outer = screen.getByPlaceholder('Search...').element().parentElement
    ?.parentElement as HTMLElement;
  expect(outer.className).not.toContain('sm:max-w-xs');
});

test('updates model value on input', async () => {
  let modelValue = '';
  const onUpdate = (val: string) => {
    modelValue = val;
  };

  const screen = await render(SearchInput, {
    props: {
      modelValue: '',
      'onUpdate:modelValue': onUpdate,
    },
    global: { plugins: [i18n] },
  });

  const input = screen.getByPlaceholder('Search...').element() as HTMLInputElement;
  input.value = 'test query';
  input.dispatchEvent(new Event('input'));

  expect(modelValue).toBe('test query');
});
