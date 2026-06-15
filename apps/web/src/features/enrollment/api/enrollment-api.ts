import type { StudentEnrollmentListResponse } from '@tutorhub/schema';

import { request } from '@/utils/request';

/** 获取学生选课列表（返回 enrollment 数据，包含嵌套的 course 对象） */
export async function fetchStudentEnrollments(
  studentId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
  },
): Promise<StudentEnrollmentListResponse> {
  const { data } = await request.get<StudentEnrollmentListResponse>(
    `/student/${studentId}/enrollment/list`,
    { params },
  );
  return data;
}
