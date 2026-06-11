import type { z } from 'zod';

import type {
  AvatarUploadUrlResponse,
  StudentAvatarUpdateResponse,
  StudentCreateResponse,
  studentCreateSchema,
  StudentDeleteResponse,
  StudentDetailResponse,
  StudentListResponse,
  StudentUpdateResponse,
  studentUpdateSchema,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

export type {
  StudentListResponse,
  StudentDetailResponse,
  StudentCreateResponse,
  StudentUpdateResponse,
  StudentDeleteResponse,
  AvatarUploadUrlResponse,
  StudentAvatarUpdateResponse,
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

/** 申请预签名上传地址 */
export async function getUploadUrl(contentType: string): Promise<AvatarUploadUrlResponse> {
  const { data } = await request.post<AvatarUploadUrlResponse>(
    '/storage/student-avatar/upload-url',
    {
      contentType,
    },
  );
  return data;
}

/** 保存学生头像 objectKey */
export async function updateStudentAvatar(
  id: string,
  avatarKey: string,
): Promise<StudentAvatarUpdateResponse> {
  const { data } = await request.patch<{ data: StudentAvatarUpdateResponse }>(
    `/student/${id}/avatar`,
    { avatarKey },
  );
  return data.data;
}
