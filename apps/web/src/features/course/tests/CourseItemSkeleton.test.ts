import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import CourseItemSkeleton from '../components/CourseItemSkeleton.vue';

test('renders skeleton structure', async () => {
  await render(CourseItemSkeleton);

  const skeletonElements = document.querySelectorAll('.animate-pulse');
  expect(skeletonElements.length).toBeGreaterThan(0);
});

test('has card-like container', async () => {
  await render(CourseItemSkeleton);

  const article = document.querySelector('article');
  expect(article).toBeDefined();
  expect(article!.className).toContain('rounded-2xl');
});

test('has gradient header bar', async () => {
  await render(CourseItemSkeleton);

  const gradientDiv = document.querySelector('[class*="bg-linear-to-r"]');
  expect(gradientDiv).toBeDefined();
});
