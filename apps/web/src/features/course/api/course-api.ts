import type { z } from 'zod';

import type {
  CourseCreateResponse,
  courseCreateSchema,
  CourseDeleteResponse,
  CourseDetailResponse,
  CourseListResponse,
  CourseUpdateResponse,
  courseUpdateSchema,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

export type {
  CourseListResponse,
  CourseDetailResponse,
  CourseCreateResponse,
  CourseUpdateResponse,
  CourseDeleteResponse,
};

/** Cursor / offset paginated fetch against the real backend API. */
export async function fetchCourses(params: {
  cursor?: string;
  offset?: number;
  limit?: number;
  name?: string;
  status?: string;
}): Promise<CourseListResponse> {
  const { data } = await request.get<CourseListResponse>('/course/list', { params });
  return data;
}

/** Fetch a single course by ID. */
export async function fetchCourseById(id: string): Promise<CourseDetailResponse> {
  const { data } = await request.get<{ data: CourseDetailResponse }>(`/course/${id}`);
  return data.data;
}

/** Create a new course. */
export async function createCourse(
  body: z.infer<typeof courseCreateSchema>,
): Promise<CourseCreateResponse> {
  const { data } = await request.post<{ data: CourseCreateResponse }>('/course', body);
  return data.data;
}

/** Update an existing course. */
export async function updateCourse(
  id: string,
  body: z.infer<typeof courseUpdateSchema>,
): Promise<CourseUpdateResponse> {
  const { data } = await request.put<{ data: CourseUpdateResponse }>(`/course/${id}`, body);
  return data.data;
}

/** Delete a course by ID. */
export async function deleteCourse(id: string): Promise<CourseDeleteResponse> {
  const { data } = await request.delete<{ data: CourseDeleteResponse }>(`/course/${id}`);
  return data.data;
}
