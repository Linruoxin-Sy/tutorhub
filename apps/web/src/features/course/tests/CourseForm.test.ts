import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import CourseForm from '../components/CourseForm.vue';

test('renders form fields in edit mode', async () => {
  const screen = await render(CourseForm, {
    props: {
      modelValue: { name: 'Math 101', description: 'Basic math', status: 'ACTIVE' },
      readonly: false,
    },
    global: {
      stubs: { SelectInput: true },
    },
  });

  await expect.element(screen.getByPlaceholder('Course name')).toBeVisible();
});

test('renders in readonly mode', async () => {
  const screen = await render(CourseForm, {
    props: {
      modelValue: { name: 'Math 101', description: 'Basic math', status: 'ACTIVE' },
      readonly: true,
    },
  });

  await expect.element(screen.getByText('Math 101')).toBeVisible();
  await expect.element(screen.getByText('Basic math')).toBeVisible();
});

test('renders disabled status in readonly mode', async () => {
  const screen = await render(CourseForm, {
    props: {
      modelValue: { name: 'New Course', description: '', status: 'DISABLED' },
      readonly: true,
    },
  });

  await expect.element(screen.getByText('New Course')).toBeVisible();
});
