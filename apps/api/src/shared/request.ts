import type { Context } from 'hono';
import { ApiError } from '@/shared/api-error';

export const readQueryParams = (c: Context): Record<string, string> => {
  return Object.fromEntries(new URL(c.req.url).searchParams.entries());
};

export const readRequiredParam = (c: Context, key: string): string => {
  const value = c.req.param(key);

  if (typeof value !== 'string' || value.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', `${key} is required`);
  }

  return value;
};

export const readJsonBody = async (c: Context): Promise<Record<string, unknown>> => {
  try {
    const body = await c.req.json();

    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Request body must be an object');
    }

    return body as Record<string, unknown>;
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be a JSON object');
  }
};

export const readRequiredText = (body: Record<string, unknown>, key: string): string => {
  const value = body[key];

  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', `${key} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', `${key} cannot be empty`);
  }

  return trimmed;
};

export const readOptionalText = (
  body: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', `${key} must be a string`);
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};

export const readOptionalNullableText = (
  body: Record<string, unknown>,
  key: string,
): string | null | undefined => {
  const value = body[key];

  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', `${key} must be a string or null`);
  }

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed;
};

export const parsePage = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '1', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export const parsePageSize = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '20', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 20;
  }

  return Math.min(parsed, 100);
};

export const parsePagination = (query: Record<string, string>) => {
  const page = parsePage(query.page);
  const pageSize = parsePageSize(query.pageSize ?? query.limit);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

export const parseOptionalDate = (value: string | undefined): Date | undefined => {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  const date = value.length === 10 ? new Date(`${value}T00:00:00.000Z`) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, 'INVALID_INPUT', 'Date must be a valid ISO date string');
  }

  return date;
};

export const parseOptionalTime = (value: string | undefined): Date | undefined => {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  if (value.includes('T')) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new ApiError(400, 'INVALID_INPUT', 'Time must be a valid ISO string');
    }

    return parsed;
  }

  const normalized = value.length === 5 ? `${value}:00` : value;
  const parsed = new Date(`1970-01-01T${normalized}.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, 'INVALID_INPUT', 'Time must use HH:mm[:ss] format');
  }

  return parsed;
};

export const readRequiredNumber = (body: Record<string, unknown>, key: string): number => {
  const value = body[key];
  const numberValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new ApiError(400, 'INVALID_INPUT', `${key} must be a number`);
  }

  return numberValue;
};

export const stripUndefined = <T extends object>(value: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as Partial<T>;
};

export const assertNonEmpty = (value: Record<string, unknown>): void => {
  if (Object.keys(value).length === 0) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }
};
