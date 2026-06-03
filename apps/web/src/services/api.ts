import { client } from '@/utils/rpc-client';
import { requestJson } from './http';
import { toQueryRecord } from './query-string';

const apiBasePath = 'http://localhost:3000/api/v1';

export function apiGetJson<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>,
) {
  return requestJson<T>(
    client.get(`${apiBasePath}/${path}`, { searchParams: toQueryRecord(query ?? {}) }),
  );
}

export function apiPostJson<T>(path: string, body: unknown) {
  return requestJson<T>(client.post(`${apiBasePath}/${path}`, { json: body }));
}

export function apiPutJson<T>(path: string, body: unknown) {
  return requestJson<T>(client.put(`${apiBasePath}/${path}`, { json: body }));
}

export function apiDeleteJson<T>(path: string) {
  return requestJson<T>(client.delete(`${apiBasePath}/${path}`));
}
