import type { StudentListResponse } from '@tutorhub/schema';
import { request } from '@/utils/request';

export type { StudentListResponse };

/** Cursor / offset paginated fetch against the real backend API. */
export async function fetchStudents(params: {
  cursor?: string;
  offset?: number;
  limit?: number;
}): Promise<StudentListResponse> {
  const { data } = await request.get<StudentListResponse>('/student/list', { params });
  return data;
}
