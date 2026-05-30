import { ApiError } from '@/shared/api-error';
import { parsePagination, readOptionalText, readRequiredText } from '@/shared/request';

export interface LeaveRecordListQuery {
  page: number;
  pageSize: number;
  classSessionId?: string;
}

export interface LeaveRecordCreateInput {
  classSessionId: string;
  reason?: string | null;
}

export interface LeaveRecordUpdateInput {
  classSessionId?: string;
  reason?: string | null;
}

export const parseLeaveRecordListQuery = (query: Record<string, string>): LeaveRecordListQuery => ({
  ...parsePagination(query),
  classSessionId: readOptionalText(query as Record<string, unknown>, 'classSessionId'),
});

export const parseLeaveRecordCreateBody = (
  body: Record<string, unknown>,
): LeaveRecordCreateInput => ({
  classSessionId: readRequiredText(body, 'classSessionId'),
  reason: readOptionalText(body, 'reason'),
});

export const parseLeaveRecordUpdateBody = (
  body: Record<string, unknown>,
): LeaveRecordUpdateInput => {
  const input: LeaveRecordUpdateInput = {
    classSessionId: readOptionalText(body, 'classSessionId'),
    reason: readOptionalText(body, 'reason'),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
