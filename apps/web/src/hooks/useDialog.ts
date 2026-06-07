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
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
};

const state = reactive<DialogState & { resolve: ((value: boolean) => void) | null }>({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  loading: false,
  resolve: null,
});

export function useDialog() {
  function confirm(options: DialogOptions): Promise<boolean> {
    Object.assign(state, defaultOptions, options, { visible: true, loading: false });

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
