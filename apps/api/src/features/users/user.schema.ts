import { ApiError } from '@/shared/api-error';
import {
  parsePagination,
  readOptionalNullableText,
  readOptionalText,
  readRequiredText,
} from '@/shared/request';

export interface UserListQuery {
  page: number;
  pageSize: number;
  q?: string;
}

export interface UserCreateInput {
  name: string;
  passwordHash: string;
  passwordSalt: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UserUpdateInput {
  name?: string;
  passwordHash?: string;
  passwordSalt?: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export const parseUserListQuery = (query: Record<string, string>): UserListQuery => ({
  ...parsePagination(query),
  q: readOptionalText(query as Record<string, unknown>, 'q'),
});

export const parseUserCreateBody = (body: Record<string, unknown>): UserCreateInput => ({
  name: readRequiredText(body, 'name'),
  passwordHash: readRequiredText(body, 'passwordHash'),
  passwordSalt: readRequiredText(body, 'passwordSalt'),
  email: readOptionalNullableText(body, 'email'),
  phone: readOptionalNullableText(body, 'phone'),
  avatarUrl: readOptionalNullableText(body, 'avatarUrl'),
});

export const parseUserUpdateBody = (body: Record<string, unknown>): UserUpdateInput => {
  const input: UserUpdateInput = {
    name: readOptionalText(body, 'name'),
    passwordHash: readOptionalText(body, 'passwordHash'),
    passwordSalt: readOptionalText(body, 'passwordSalt'),
    email: readOptionalNullableText(body, 'email'),
    phone: readOptionalNullableText(body, 'phone'),
    avatarUrl: readOptionalNullableText(body, 'avatarUrl'),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
