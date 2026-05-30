import { ApiError } from '@/shared/api-error';
import { parsePagination, readOptionalText, readRequiredText } from '@/shared/request';

export interface StudentCourseListQuery {
  page: number;
  pageSize: number;
  studentId?: string;
  courseId?: string;
}

export interface StudentCourseCreateInput {
  studentId: string;
  courseId: string;
}

export interface StudentCourseUpdateInput {
  studentId?: string;
  courseId?: string;
}

export const parseStudentCourseListQuery = (
  query: Record<string, string>,
): StudentCourseListQuery => ({
  ...parsePagination(query),
  studentId: readOptionalText(query as Record<string, unknown>, 'studentId'),
  courseId: readOptionalText(query as Record<string, unknown>, 'courseId'),
});

export const parseStudentCourseCreateBody = (
  body: Record<string, unknown>,
): StudentCourseCreateInput => ({
  studentId: readRequiredText(body, 'studentId'),
  courseId: readRequiredText(body, 'courseId'),
});

export const parseStudentCourseUpdateBody = (
  body: Record<string, unknown>,
): StudentCourseUpdateInput => {
  const input: StudentCourseUpdateInput = {
    studentId: readOptionalText(body, 'studentId'),
    courseId: readOptionalText(body, 'courseId'),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
