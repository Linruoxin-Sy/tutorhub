import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import { h } from 'vue';

import SelectInput from '../SelectInput.vue';

test('renders options passed via default slot', async () => {
  const screen = await render(SelectInput, {
    props: { modelValue: '' },
    slots: {
      default: () => [
        h('option', { value: '' }, 'All'),
        h('option', { value: 'ACTIVE' }, 'Active'),
        h('option', { value: 'DISABLED' }, 'Disabled'),
      ],
    },
  });

  const select = screen.getByRole('combobox').element() as HTMLSelectElement;
  expect(select.options.length).toBe(3);
  expect(select.options[0]!.value).toBe('');
  expect(select.options[1]!.value).toBe('ACTIVE');
});

test('renders with sm size', async () => {
  const screen = await render(SelectInput, {
    props: { modelValue: '', size: 'sm' },
    slots: { default: () => [h('option', { value: '' }, 'All')] },
  });

  const select = screen.getByRole('combobox').element() as HTMLSelectElement;
  expect(select.className).toContain('py-2.5');
});

test('renders with md size', async () => {
  const screen = await render(SelectInput, {
    props: { modelValue: '', size: 'md' },
    slots: { default: () => [h('option', { value: '' }, 'All')] },
  });

  const select = screen.getByRole('combobox').element() as HTMLSelectElement;
  expect(select.className).toContain('px-4');
  expect(select.className).toContain('py-3');
});

test('updates model value on selection change', async () => {
  let modelValue = '';
  const onUpdate = (val: string) => {
    modelValue = val;
  };

  const screen = await render(SelectInput, {
    props: {
      modelValue: '',
      'onUpdate:modelValue': onUpdate,
    },
    slots: {
      default: () => [
        h('option', { value: '' }, 'All'),
        h('option', { value: 'ACTIVE' }, 'Active'),
      ],
    },
  });

  const select = screen.getByRole('combobox').element() as HTMLSelectElement;
  select.value = 'ACTIVE';
  select.dispatchEvent(new Event('change', { bubbles: true }));

  expect(modelValue).toBe('ACTIVE');
});

test('displays selected value', async () => {
  const screen = await render(SelectInput, {
    props: { modelValue: 'ACTIVE' },
    slots: {
      default: () => [
        h('option', { value: '' }, 'All'),
        h('option', { value: 'ACTIVE' }, 'Active'),
      ],
    },
  });

  const select = screen.getByRole('combobox').element() as HTMLSelectElement;
  expect(select.value).toBe('ACTIVE');
});
