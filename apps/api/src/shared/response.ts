import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export interface PageResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export const sendData = <T>(c: Context, data: T, status: ContentfulStatusCode = 200) => {
  return c.json({ data }, status);
};

export const sendPage = <T>(c: Context, response: PageResponse<T>) => {
  return c.json(response);
};
