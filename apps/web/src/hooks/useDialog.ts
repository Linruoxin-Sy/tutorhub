import { i18n } from '@/locales';

export interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export interface DialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'primary';
  loading: boolean;
}

const defaultOptions: Required<Omit<DialogOptions, keyof unknown>> = {
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  variant: 'danger',
};

const state = reactive<DialogState & { resolve: ((value: boolean) => void) | null }>({
  visible: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  variant: 'danger',
  loading: false,
  resolve: null,
});

export function useDialog() {
  function confirm(options: DialogOptions): Promise<boolean> {
    // 默认按钮文案惰性解析（跟随当前语言），调用方传值则覆盖
    Object.assign(
      state,
      defaultOptions,
      {
        confirmText: i18n.global.t('common.actions.confirm'),
        cancelText: i18n.global.t('common.actions.cancel'),
      },
      options,
      { visible: true, loading: false },
    );

    return new Promise((resolve) => {
      state.resolve = resolve;
    });
  }

  function resolveDialog(value: boolean) {
    state.resolve?.(value);
    state.visible = false;
    state.resolve = null;
  }

  return { state, confirm, resolveDialog };
}
