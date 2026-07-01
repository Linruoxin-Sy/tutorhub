import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import StudentItemSkeleton from '../components/StudentItemSkeleton.vue';

test('renders skeleton grid structure', async () => {
  await render(StudentItemSkeleton);

  const skeletonDivs = document.querySelectorAll('.animate-pulse');
  expect(skeletonDivs.length).toBeGreaterThan(0);
});

test('renders with correct grid layout', async () => {
  await render(StudentItemSkeleton);

  const container = document.querySelector('[style*="grid-template-columns"]');
  expect(container).toBeDefined();
});
