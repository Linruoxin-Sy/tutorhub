import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import EditButton from '@/components/EditButton.vue';

test('renders the edit button', async () => {
  const screen = await render(EditButton);

  await expect.element(screen.getByText('Edit')).toBeVisible();
});

test('renders pen icon', async () => {
  const screen = await render(EditButton);

  const button = screen.getByText('Edit').element().closest('button') as HTMLButtonElement;
  const icon = button.querySelector('.i-lucide-square-pen');
  expect(icon).toBeDefined();
});

test('has blue color classes', async () => {
  const screen = await render(EditButton);

  const button = screen.getByText('Edit').element().closest('button') as HTMLButtonElement;
  expect(button.className).toContain('text-blue-600');
});
