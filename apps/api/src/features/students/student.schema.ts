import { ApiError } from '@/shared/api-error';
import {
  parsePagination,
  readOptionalNullableText,
  readOptionalText,
  readRequiredText,
} from '@/shared/request';

export interface StudentListQuery {
  page: number;
  pageSize: number;
  userId?: string;
  q?: string;
}

export interface StudentCreateInput {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  grade?: string | null;
  description?: string | null;
}

export interface StudentUpdateInput {
  userId?: string;
  name?: string;
  avatarUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  grade?: string | null;
  description?: string | null;
}

export const parseStudentListQuery = (query: Record<string, string>): StudentListQuery => ({
  ...parsePagination(query),
  userId: readOptionalText(query as Record<string, unknown>, 'userId'),
  q: readOptionalText(query as Record<string, unknown>, 'q'),
});

export const parseStudentCreateBody = (body: Record<string, unknown>): StudentCreateInput => ({
  userId: readRequiredText(body, 'userId'),
  name: readRequiredText(body, 'name'),
  avatarUrl: readOptionalNullableText(body, 'avatarUrl'),
  email: readOptionalNullableText(body, 'email'),
  phone: readOptionalNullableText(body, 'phone'),
  grade: readOptionalNullableText(body, 'grade'),
  description: readOptionalNullableText(body, 'description'),
});

export const parseStudentUpdateBody = (body: Record<string, unknown>): StudentUpdateInput => {
  const input: StudentUpdateInput = {
    userId: readOptionalText(body, 'userId'),
    name: readOptionalText(body, 'name'),
    avatarUrl: readOptionalNullableText(body, 'avatarUrl'),
    email: readOptionalNullableText(body, 'email'),
    phone: readOptionalNullableText(body, 'phone'),
    grade: readOptionalNullableText(body, 'grade'),
    description: readOptionalNullableText(body, 'description'),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
