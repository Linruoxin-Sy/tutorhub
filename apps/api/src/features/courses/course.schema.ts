import { ApiError } from '@/shared/api-error';
import { parsePagination, readOptionalText, readRequiredText } from '@/shared/request';

export type CourseStatus = 'ACTIVE' | 'DISABLED';

export interface CourseListQuery {
  page: number;
  pageSize: number;
  q?: string;
  status?: CourseStatus;
}

export interface CourseCreateInput {
  name: string;
  description?: string | null;
  status?: CourseStatus;
}

export interface CourseUpdateInput {
  name?: string;
  description?: string | null;
  status?: CourseStatus;
}

const parseStatus = (value: string | undefined): CourseStatus | undefined => {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  if (value !== 'ACTIVE' && value !== 'DISABLED') {
    throw new ApiError(400, 'INVALID_INPUT', 'status must be ACTIVE or DISABLED');
  }

  return value;
};

export const parseCourseListQuery = (query: Record<string, string>): CourseListQuery => ({
  ...parsePagination(query),
  q: readOptionalText(query as Record<string, unknown>, 'q'),
  status: parseStatus(query.status),
});

export const parseCourseCreateBody = (body: Record<string, unknown>): CourseCreateInput => ({
  name: readRequiredText(body, 'name'),
  description: readOptionalText(body, 'description'),
  status: parseStatus(readOptionalText(body, 'status')),
});

export const parseCourseUpdateBody = (body: Record<string, unknown>): CourseUpdateInput => {
  const input: CourseUpdateInput = {
    name: readOptionalText(body, 'name'),
    description: readOptionalText(body, 'description'),
    status: parseStatus(readOptionalText(body, 'status')),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
