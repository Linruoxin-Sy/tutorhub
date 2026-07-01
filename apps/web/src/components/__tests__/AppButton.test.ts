import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import AppButton from '../AppButton.vue';

test('renders default primary variant', async () => {
  const screen = await render(AppButton, {
    slots: { default: () => 'Click me' },
  });

  const button = screen.getByText('Click me').element() as HTMLButtonElement;
  expect(button.className).toContain('bg-blue-600');
  expect(button.className).toContain('text-white');
});

test('renders secondary variant', async () => {
  const screen = await render(AppButton, {
    props: { variant: 'secondary' },
    slots: { default: () => 'Cancel' },
  });

  const button = screen.getByText('Cancel').element() as HTMLButtonElement;
  expect(button.className).toContain('border-gray-200');
});

test('renders danger variant', async () => {
  const screen = await render(AppButton, {
    props: { variant: 'danger' },
    slots: { default: () => 'Delete' },
  });

  const button = screen.getByText('Delete').element() as HTMLButtonElement;
  expect(button.className).toContain('bg-red-600');
});

test('disables button when disabled prop is true', async () => {
  const screen = await render(AppButton, {
    props: { disabled: true },
    slots: { default: () => 'Click me' },
  });

  const button = screen.getByText('Click me').element() as HTMLButtonElement;
  expect(button.disabled).toBe(true);
});

test('enables button when disabled prop is false', async () => {
  const screen = await render(AppButton, {
    props: { disabled: false },
    slots: { default: () => 'Click me' },
  });

  const button = screen.getByText('Click me').element() as HTMLButtonElement;
  expect(button.disabled).toBe(false);
});

test('renders slot content', async () => {
  const screen = await render(AppButton, {
    slots: { default: () => '<i class="i-lucide-plus"></i> Add' },
  });

  await expect.element(screen.getByText('Add')).toBeVisible();
});

test('applies disabled styles', async () => {
  const screen = await render(AppButton, {
    props: { disabled: true },
    slots: { default: () => 'Click me' },
  });

  const button = screen.getByText('Click me').element() as HTMLButtonElement;
  expect(button.className).toContain('disabled:opacity-50');
});
