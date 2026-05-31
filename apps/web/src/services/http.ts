type JsonResponse<T> = {
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export async function requestJson<T>(request: Promise<Response>): Promise<T> {
  const response = await request;
  const payload = (await response.json().catch(() => null)) as JsonResponse<T> | null;

  if (!response.ok) {
    const errorMessage = payload?.error?.message ?? `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}
