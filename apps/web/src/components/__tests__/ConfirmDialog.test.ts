import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';

import { useDialog } from '@/hooks/useDialog';

import ConfirmDialog from '../ConfirmDialog.vue';

test('does not render dialog when not triggered', async () => {
  await render(ConfirmDialog);

  // Dialog 默认不可见 — dialog 元素存在但未打开
  const dialog = document.querySelector('dialog');
  expect(dialog).toBeDefined();
  expect(dialog!.open).toBe(false);
});

test('renders dialog title and message after confirm() is called', async () => {
  await render(ConfirmDialog);
  const { confirm } = useDialog();

  // 触发弹窗
  confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
  });
  await new Promise((r) => setTimeout(r, 50));

  const dialog = document.querySelector('dialog');
  expect(dialog!.open).toBe(true);
  expect(document.querySelector('h3')?.textContent).toBe('Delete Item');
  const paragraphs = document.querySelectorAll('p');
  const messageEl = Array.from(paragraphs).find((p) => p.textContent?.includes('Are you sure'));
  expect(messageEl).toBeDefined();
  expect(messageEl!.textContent).toContain('Are you sure you want to delete this item?');
});

test('renders with primary variant', async () => {
  const screen = await render(ConfirmDialog);
  const { confirm } = useDialog();

  confirm({
    title: 'Confirm',
    message: 'Proceed?',
    confirmText: 'OK',
    variant: 'primary',
  });
  await new Promise((r) => setTimeout(r, 50));

  const confirmBtn = screen.getByText('OK').element() as HTMLButtonElement;
  expect(confirmBtn.className).toContain('btn-primary');
});

test('renders with danger variant has btn-error class', async () => {
  await render(ConfirmDialog);
  const { confirm } = useDialog();

  confirm({
    title: 'Delete',
    message: 'Delete?',
    confirmText: 'Delete',
    variant: 'danger',
  });
  await new Promise((r) => setTimeout(r, 50));

  // 找到 modal-action 区域中的确认按钮（第二个按钮）
  const modalActions = document.querySelector('.modal-action');
  const buttons = modalActions?.querySelectorAll('button');
  expect(buttons).toBeDefined();
  const confirmBtn = buttons![1] as HTMLButtonElement;
  expect(confirmBtn.className).toContain('btn-error');
});

test('resolves with true on confirm button click', async () => {
  await render(ConfirmDialog);
  const { confirm } = useDialog();

  const promise = confirm({
    title: 'Confirm',
    message: 'Proceed?',
    confirmText: 'OK',
  });
  await new Promise((r) => setTimeout(r, 100));

  // 找到 modal-action 中的确认按钮并点击
  const modalActions = document.querySelector('.modal-action');
  const buttons = modalActions?.querySelectorAll('button');
  const confirmBtn = buttons![1] as HTMLButtonElement;
  confirmBtn.click();
  await new Promise((r) => setTimeout(r, 50));

  const result = await promise;
  expect(result).toBe(true);
});

test('resolves with false on cancel button click', async () => {
  await render(ConfirmDialog);
  const { confirm } = useDialog();

  const promise = confirm({
    title: 'Confirm',
    message: 'Proceed?',
    cancelText: 'Cancel',
  });
  await new Promise((r) => setTimeout(r, 100));

  // 找到 modal-action 中的取消按钮并点击
  const modalActions = document.querySelector('.modal-action');
  const buttons = modalActions?.querySelectorAll('button');
  const cancelBtn = buttons![0] as HTMLButtonElement;
  cancelBtn.click();
  await new Promise((r) => setTimeout(r, 50));

  const result = await promise;
  expect(result).toBe(false);
});

test('shows loading spinner on confirm button when loading', async () => {
  await render(ConfirmDialog);
  const { confirm, state } = useDialog();

  confirm({
    title: 'Loading',
    message: 'Processing...',
    confirmText: 'Save',
  });
  await new Promise((r) => setTimeout(r, 50));

  // Manually set loading
  state.loading = true;
  await new Promise((r) => setTimeout(r, 50));

  const spinner = document.querySelector('.loading-spinner');
  expect(spinner).toBeDefined();
});

test('disables buttons during loading', async () => {
  await render(ConfirmDialog);
  const { confirm, state } = useDialog();

  confirm({
    title: 'Loading',
    message: 'Processing...',
    confirmText: 'Save',
  });
  await new Promise((r) => setTimeout(r, 50));

  state.loading = true;
  await new Promise((r) => setTimeout(r, 50));

  const buttons = document.querySelectorAll('.modal-action button');
  buttons.forEach((btn) => {
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});
