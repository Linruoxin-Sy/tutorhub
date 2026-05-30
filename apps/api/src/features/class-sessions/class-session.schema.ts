import { ApiError } from '@/shared/api-error';
import {
  parseOptionalDate,
  parseOptionalTime,
  parsePagination,
  readOptionalText,
  readRequiredText,
} from '@/shared/request';

export interface ClassSessionListQuery {
  page: number;
  pageSize: number;
  studentCourseId?: string;
  classDate?: Date;
}

export interface ClassSessionCreateInput {
  studentCourseId: string;
  classDate: Date;
  startTime: Date;
  endTime: Date;
}

export interface ClassSessionUpdateInput {
  studentCourseId?: string;
  classDate?: Date;
  startTime?: Date;
  endTime?: Date;
}

export const parseClassSessionListQuery = (
  query: Record<string, string>,
): ClassSessionListQuery => ({
  ...parsePagination(query),
  studentCourseId: readOptionalText(query as Record<string, unknown>, 'studentCourseId'),
  classDate: parseOptionalDate(query.classDate),
});

export const parseClassSessionCreateBody = (
  body: Record<string, unknown>,
): ClassSessionCreateInput => ({
  studentCourseId: readRequiredText(body, 'studentCourseId'),
  classDate: parseOptionalDate(readRequiredText(body, 'classDate'))!,
  startTime: parseOptionalTime(readRequiredText(body, 'startTime'))!,
  endTime: parseOptionalTime(readRequiredText(body, 'endTime'))!,
});

export const parseClassSessionUpdateBody = (
  body: Record<string, unknown>,
): ClassSessionUpdateInput => {
  const input: ClassSessionUpdateInput = {
    studentCourseId: readOptionalText(body, 'studentCourseId'),
    classDate: parseOptionalDate(readOptionalText(body, 'classDate')),
    startTime: parseOptionalTime(readOptionalText(body, 'startTime')),
    endTime: parseOptionalTime(readOptionalText(body, 'endTime')),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
