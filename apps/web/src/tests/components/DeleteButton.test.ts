import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import DeleteButton from '@/components/DeleteButton.vue';
import { i18n } from '@/locales';

test('renders the delete button', async () => {
  const screen = await render(DeleteButton, { global: { plugins: [i18n] } });

  await expect.element(screen.getByText('Delete')).toBeVisible();
});

test('renders trash icon', async () => {
  const screen = await render(DeleteButton, { global: { plugins: [i18n] } });

  const button = screen.getByText('Delete').element().closest('button') as HTMLButtonElement;
  const icon = button.querySelector('.i-lucide-trash-2');
  expect(icon).toBeDefined();
});

test('has red color classes', async () => {
  const screen = await render(DeleteButton, { global: { plugins: [i18n] } });

  const button = screen.getByText('Delete').element().closest('button') as HTMLButtonElement;
  expect(button.className).toContain('text-red-600');
});
