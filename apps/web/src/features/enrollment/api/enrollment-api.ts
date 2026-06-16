import type {
  AvailableCoursesResponse,
  AvailableStudentsResponse,
  CourseEnrollmentListResponse,
  EnrollmentCreateResponse,
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

/** 获取学生尚未选中的可选课程列表 */
export async function fetchAvailableCourses(
  studentId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
    name?: string;
    status?: string;
  },
): Promise<AvailableCoursesResponse> {
  const { data } = await request.get<AvailableCoursesResponse>(
    `/student/${studentId}/available-courses`,
    { params },
  );
  return data;
}

/** 获取课程尚未选中的可选学生列表 */
export async function fetchAvailableStudents(
  courseId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
    name?: string;
  },
): Promise<AvailableStudentsResponse> {
  const { data } = await request.get<AvailableStudentsResponse>(
    `/course/${courseId}/available-students`,
    { params },
  );
  return data;
}

/** 创建选课关系 */
export async function createEnrollment(
  studentId: string,
  courseId: string,
): Promise<EnrollmentCreateResponse> {
  const { data } = await request.post<{ data: EnrollmentCreateResponse }>('/enrollment', {
    studentId,
    courseId,
  });
  return data.data;
}
