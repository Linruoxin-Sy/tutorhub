import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import CardSection from '@/components/CardSection.vue';

test('renders default slot content', async () => {
  const screen = await render(CardSection, {
    slots: { default: () => 'Card Content' },
  });

  await expect.element(screen.getByText('Card Content')).toBeVisible();
});

test('renders with rounded-2xl class', async () => {
  const screen = await render(CardSection, {
    slots: { default: () => 'Content' },
  });

  const section = screen.getByText('Content').element().closest('section');
  expect(section).toBeDefined();
  expect(section!.className).toContain('rounded-2xl');
});

test('renders complex slot content', async () => {
  const screen = await render(CardSection, {
    slots: {
      default: () => '<div class="complex"><p>Nested content</p></div>',
    },
  });

  await expect.element(screen.getByText('Nested content')).toBeVisible();
});
