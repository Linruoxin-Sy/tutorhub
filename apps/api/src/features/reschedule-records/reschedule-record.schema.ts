import { ApiError } from '@/shared/api-error';
import { parsePagination, readOptionalText, readRequiredText } from '@/shared/request';

export interface RescheduleRecordListQuery {
  page: number;
  pageSize: number;
  originalSessionId?: string;
  newSessionId?: string;
}

export interface RescheduleRecordCreateInput {
  originalSessionId: string;
  newSessionId: string;
  reason?: string | null;
}

export interface RescheduleRecordUpdateInput {
  originalSessionId?: string;
  newSessionId?: string;
  reason?: string | null;
}

export const parseRescheduleRecordListQuery = (
  query: Record<string, string>,
): RescheduleRecordListQuery => ({
  ...parsePagination(query),
  originalSessionId: readOptionalText(query as Record<string, unknown>, 'originalSessionId'),
  newSessionId: readOptionalText(query as Record<string, unknown>, 'newSessionId'),
});

export const parseRescheduleRecordCreateBody = (
  body: Record<string, unknown>,
): RescheduleRecordCreateInput => ({
  originalSessionId: readRequiredText(body, 'originalSessionId'),
  newSessionId: readRequiredText(body, 'newSessionId'),
  reason: readOptionalText(body, 'reason'),
});

export const parseRescheduleRecordUpdateBody = (
  body: Record<string, unknown>,
): RescheduleRecordUpdateInput => {
  const input: RescheduleRecordUpdateInput = {
    originalSessionId: readOptionalText(body, 'originalSessionId'),
    newSessionId: readOptionalText(body, 'newSessionId'),
    reason: readOptionalText(body, 'reason'),
  };

  if (Object.values(input).every((value) => value === undefined)) {
    throw new ApiError(400, 'EMPTY_BODY', 'Request body cannot be empty');
  }

  return input;
};
