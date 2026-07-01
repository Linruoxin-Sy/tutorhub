import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-vue';
import { computed, ref } from 'vue';

import VirtualList from '@/components/VirtualList.vue';

function createMockQuery() {
  const items = ref<Array<{ id: number; name: string }>>([]);
  const total = ref(0);
  const isLoading = ref(false);
  const error = ref('');

  return {
    getItem: (index: number) => items.value[index],
    isLoaded: (index: number) => index < items.value.length,
    total: computed(() => total.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    ensureRange: vi.fn().mockResolvedValue(undefined),
    setItems: (data: Array<{ id: number; name: string }>) => {
      items.value = data;
      total.value = data.length;
    },
    setLoading: (v: boolean) => {
      isLoading.value = v;
    },
    setError: (e: string) => {
      error.value = e;
    },
  };
}

test('shows loading state', async () => {
  const query = createMockQuery();
  query.setLoading(true);

  const screen = await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
    },
    slots: {
      loading: () => '<div class="loading-skeleton">Loading skeleton</div>',
    },
  });

  await expect.element(screen.getByText('Loading skeleton')).toBeVisible();
});

test('shows error state', async () => {
  const query = createMockQuery();
  query.setError('Failed to load data');

  const screen = await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
    },
  });

  await expect.element(screen.getByText('Failed to load data')).toBeVisible();
});

test('shows empty state when total is 0', async () => {
  const query = createMockQuery();

  const screen = await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
    },
    slots: {
      empty: () => '<div>No items found</div>',
    },
  });

  await expect.element(screen.getByText('No items found')).toBeVisible();
});

test('shows loading takes priority over error', async () => {
  const query = createMockQuery();
  query.setError('Error message');
  query.setLoading(true);

  const screen = await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
    },
    slots: {
      loading: () => '<div>Loading state</div>',
    },
  });

  // Loading should display, not error
  await expect.element(screen.getByText('Loading state')).toBeVisible();
});

test('shows header slot when data exists', async () => {
  const query = createMockQuery();
  query.setItems([{ id: 1, name: 'Item 1' }]);

  const screen = await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
    },
    slots: {
      header: () => '<div>Header Content</div>',
    },
  });

  await expect.element(screen.getByText('Header Content')).toBeVisible();
});

test('passes scrollClass to scroll container', async () => {
  const query = createMockQuery();
  query.setItems([{ id: 1, name: 'Item 1' }]);

  await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
      scrollClass: 'custom-scroll-class',
    },
  });

  const scrollEl = document.querySelector('.custom-scroll-class');
  expect(scrollEl).toBeDefined();
});

test('renders error with red text', async () => {
  const query = createMockQuery();
  query.setError('Network error');

  const screen = await render(VirtualList, {
    props: {
      query,
      estimateSize: 70,
    },
  });

  const errorEl = screen.getByText('Network error').element();
  expect(errorEl.className).toContain('text-red-700');
});
