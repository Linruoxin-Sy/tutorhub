import { ApiError } from '@/shared/api-error';
import {
  parseOptionalDate,
  parseOptionalTime,
  parsePagination,
  readOptionalText,
  readRequiredNumber,
  readRequiredText,
} from '@/shared/request';

export interface ClassRuleListQuery {
  page: number;
  pageSize: number;
  studentCourseId?: string;
}

export interface ClassRuleCreateInput {
  studentCourseId: string;
  startDate: Date;
  intervalDays: number;
  endDate?: Date | null;
  startTime: Date;
  endTime: Date;
}

export interface ClassRuleUpdateInput {
  studentCourseId?: string;
  startDate?: Date;
  intervalDays?: number;
  endDate?: Date | null;
  startTime?: Date;
  endTime?: Date;
}

export const parseClassRuleListQuery = (query: Record<string, string>): ClassRuleListQuery => ({
  ...parsePagination(query),
  studentCourseId: readOptionalText(query as Record<string, unknown>, 'studentCourseId'),
});

export const parseClassRuleCreateBody = (body: Record<string, unknown>): ClassRuleCreateInput => ({
  studentCourseId: readRequiredText(body, 'studentCourseId'),
  startDate: parseOptionalDate(readRequiredText(body, 'startDate'))!,
  intervalDays: readRequiredNumber(body, 'intervalDays'),
  endDate: parseOptionalDate(readOptionalText(body, 'endDate')) ?? null,
  startTime: parseOptionalTime(readRequiredText(body, 'startTime'))!,
  endTime: parseOptionalTime(readRequiredText(body, 'endTime'))!,
});

export const parseClassRuleUpdateBody = (body: Record<string, unknown>): ClassRuleUpdateInput => {
  const input: ClassRuleUpdateInput = {
    studentCourseId: readOptionalText(body, 'studentCourseId'),
    startDate: parseOptionalDate(readOptionalText(body, 'startDate')),
    intervalDays:
      body.intervalDays === undefined ? undefined : readRequiredNumber(body, 'intervalDays'),
    endDate: parseOptionalDate(readOptionalText(body, 'endDate')),
    startTime: parseOptionalTime(readOptionalText(body, 'startTime')),
    endTime: parseOptionalTime(readOptionalText(body, 'endTime')),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
