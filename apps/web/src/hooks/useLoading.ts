type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>;
type AnyFunction = ((...args: unknown[]) => unknown) | AnyAsyncFunction;

type UseLoadingReturn = {
  withLoading: <T extends AnyFunction>(
    fn: T,
  ) => (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>;
  isLoading: boolean;
};

type UseLoadingWithRefReturn = UseLoadingReturn & {
  isLoadingRef: Readonly<Ref<boolean>>;
};

export function useLoading(options: { ref: true }): UseLoadingWithRefReturn;
export function useLoading(options?: { ref?: false }): UseLoadingReturn;
export function useLoading(options?: {
  ref?: boolean;
}): UseLoadingReturn | UseLoadingWithRefReturn {
  const isNeedRef = options?.ref ?? false;
  let isLoading = false;
  const isLoadingRef = isNeedRef ? ref(isLoading) : undefined;

  function _withLoading<T extends AnyFunction>(fn: T) {
    return async function (...args: Parameters<T>): Promise<ReturnType<T> | undefined> {
      if (isLoading) return undefined;
      if (isRef(isLoadingRef)) isLoadingRef.value = true;
      isLoading = true;
      try {
        return (await fn(...args)) as ReturnType<T>;
      } finally {
        isLoading = false;
        if (isRef(isLoadingRef)) isLoadingRef.value = false;
      }
    };
  }

  function withLoading<T extends AnyFunction>(
    fn: T,
  ): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined>;
  function withLoading<T extends AnyFunction[]>(
    ...fns: T
  ): {
    [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]> | undefined>;
  };
  function withLoading(...fns: AnyFunction[]) {
    if (fns.length === 0) return () => {};
    if (fns.length === 1) return _withLoading(fns[0]!);
    return fns.map((fn) => _withLoading(fn));
  }

  if (isRef(isLoadingRef)) {
    return {
      withLoading,
      isLoading,
      isLoadingRef: readonly(isLoadingRef),
    };
  }

  return {
    withLoading,
    isLoading,
  };
}
