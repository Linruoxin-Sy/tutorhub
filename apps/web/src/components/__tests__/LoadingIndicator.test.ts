import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import LoadingIndicator from '../LoadingIndicator.vue';

test('renders default text', async () => {
  const screen = await render(LoadingIndicator, {
    props: { text: 'Loading...' },
  });

  await expect.element(screen.getByText('Loading...')).toBeVisible();
});

test('renders custom text', async () => {
  const screen = await render(LoadingIndicator, {
    props: { text: 'Please wait...' },
  });

  await expect.element(screen.getByText('Please wait...')).toBeVisible();
});

test('renders spinner icon', async () => {
  const screen = await render(LoadingIndicator, {
    props: { text: 'Loading...' },
  });

  const icon = screen.getByText('Loading...').element()
    .previousElementSibling as HTMLElement | null;
  expect(icon?.className).toContain('i-lucide-loader-circle');
});

test('renders centered layout', async () => {
  const screen = await render(LoadingIndicator, {
    props: { text: 'Loading...' },
  });

  const container = screen.getByText('Loading...').element().parentElement as HTMLElement;
  expect(container.className).toContain('items-center');
  expect(container.className).toContain('justify-center');
});
