type AnyAsyncFunction = (...args: unknown[]) => Promise<unknown>;
type AnyFunction = ((...args: unknown[]) => unknown) | AnyAsyncFunction;

type UseLoadingReturn = {
  withLoading: <T extends AnyFunction>(
    fn: T,
  ) => (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
  isLoading: () => boolean;
  isLoadingRef: Readonly<Ref<boolean>>;
};

export function useLoading(): UseLoadingReturn {
  let isLoading = false;
  const isLoadingRef = ref(isLoading);

  function _withLoading<T extends AnyFunction>(fn: T) {
    return async function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
      if (isLoading) return undefined as Awaited<ReturnType<T>>;
      isLoadingRef.value = true;
      isLoading = true;
      try {
        return (await fn(...args)) as Awaited<ReturnType<T>>;
      } finally {
        isLoading = false;
        isLoadingRef.value = false;
      }
    };
  }

  function withLoading<T extends AnyFunction>(
    fn: T,
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
  function withLoading<T extends AnyFunction[]>(
    ...fns: T
  ): {
    [K in keyof T]: (...args: Parameters<T[K]>) => Promise<Awaited<ReturnType<T[K]>>>;
  };
  function withLoading(...fns: AnyFunction[]) {
    if (fns.length === 0) return () => {};
    if (fns.length === 1) return _withLoading(fns[0]!);
    return fns.map((fn) => _withLoading(fn));
  }

  return {
    withLoading,
    isLoading: () => isLoading,
    isLoadingRef: computed(() => isLoadingRef.value),
  };
}
