import type {
  StudentListResponse,
  StudentDetailResponse,
  StudentCreateResponse,
  StudentUpdateResponse,
  StudentDeleteResponse,
} from '@tutorhub/schema';
import type { z } from 'zod';
import type { studentCreateSchema, studentUpdateSchema } from '@tutorhub/schema';
import { request } from '@/utils/request';

export type {
  StudentListResponse,
  StudentDetailResponse,
  StudentCreateResponse,
  StudentUpdateResponse,
  StudentDeleteResponse,
};

/** Cursor / offset paginated fetch against the real backend API. */
export async function fetchStudents(params: {
  cursor?: string;
  offset?: number;
  limit?: number;
}): Promise<StudentListResponse> {
  const { data } = await request.get<StudentListResponse>('/student/list', { params });
  return data;
}

/** Fetch a single student by ID. */
export async function fetchStudentById(id: string): Promise<StudentDetailResponse> {
  const { data } = await request.get<{ data: StudentDetailResponse }>(`/student/${id}`);
  return data.data;
}

/** Create a new student. */
export async function createStudent(
  body: z.infer<typeof studentCreateSchema>,
): Promise<StudentCreateResponse> {
  const { data } = await request.post<{ data: StudentCreateResponse }>('/student', body);
  return data.data;
}

/** Update an existing student. */
export async function updateStudent(
  id: string,
  body: z.infer<typeof studentUpdateSchema>,
): Promise<StudentUpdateResponse> {
  const { data } = await request.put<{ data: StudentUpdateResponse }>(`/student/${id}`, body);
  return data.data;
}

/** Delete (soft-delete) a student by ID. */
export async function deleteStudent(id: string): Promise<StudentDeleteResponse> {
  const { data } = await request.delete<{ data: StudentDeleteResponse }>(`/student/${id}`);
  return data.data;
}
