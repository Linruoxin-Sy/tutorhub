import type {
  CourseEnrollmentListResponse,
  EnrollmentDeleteResponse,
  StudentEnrollmentListResponse,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

/** 获取学生选课列表（返回 enrollment 数据，包含嵌套的 course 对象） */
export async function fetchStudentEnrollments(
  studentId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
    name?: string;
  },
): Promise<StudentEnrollmentListResponse> {
  const { data } = await request.get<StudentEnrollmentListResponse>(
    `/student/${studentId}/enrollment/list`,
    { params },
  );
  return data;
}

/** 获取课程选课列表（返回 enrollment 数据，包含嵌套的 student 对象） */
export async function fetchCourseEnrollments(
  courseId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
    name?: string;
  },
): Promise<CourseEnrollmentListResponse> {
  const { data } = await request.get<CourseEnrollmentListResponse>(
    `/course/${courseId}/enrollment/list`,
    { params },
  );
  return data;
}

/** 软删除选课关系 */
export async function deleteEnrollment(id: string): Promise<EnrollmentDeleteResponse> {
  const { data } = await request.delete<{ data: EnrollmentDeleteResponse }>(`/enrollment/${id}`);
  return data.data;
}
