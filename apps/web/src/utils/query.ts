import { QueryClient } from '@tanstack/vue-query';

import { extractApiError } from './api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError(error) {
        const normalized = extractApiError(error);
        console.error(`[mutation error] ${normalized.code}: ${normalized.message}`, normalized);
      },
    },
  },
});
