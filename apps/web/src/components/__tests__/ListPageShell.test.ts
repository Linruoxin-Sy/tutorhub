import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import ListPageShell from '../ListPageShell.vue';

test('renders title', async () => {
  const screen = await render(ListPageShell, {
    props: { title: 'Students' },
  });

  await expect.element(screen.getByText('Students')).toBeVisible();
});

test('renders description when provided', async () => {
  const screen = await render(ListPageShell, {
    props: { title: 'Students', description: 'Manage your students' },
  });

  await expect.element(screen.getByText('Manage your students')).toBeVisible();
});

test('renders filters slot', async () => {
  const screen = await render(ListPageShell, {
    props: { title: 'Students' },
    slots: {
      filters: () => 'Filter content',
    },
  });

  await expect.element(screen.getByText('Filter content')).toBeVisible();
});

test('renders actions slot', async () => {
  const screen = await render(ListPageShell, {
    props: { title: 'Students' },
    slots: {
      actions: () => 'Action content',
    },
  });

  await expect.element(screen.getByText('Action content')).toBeVisible();
});

test('renders default slot content', async () => {
  const screen = await render(ListPageShell, {
    props: { title: 'Students' },
    slots: {
      default: () => 'Default content',
    },
  });

  await expect.element(screen.getByText('Default content')).toBeVisible();
});

test('renders all slots simultaneously', async () => {
  const screen = await render(ListPageShell, {
    props: { title: 'Students', description: 'All students' },
    slots: {
      filters: () => 'FilterText',
      actions: () => 'ActionText',
      default: () => 'ContentText',
    },
  });

  await expect.element(screen.getByText('FilterText')).toBeVisible();
  await expect.element(screen.getByText('ActionText')).toBeVisible();
  await expect.element(screen.getByText('ContentText')).toBeVisible();
});
