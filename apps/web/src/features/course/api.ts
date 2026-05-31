import { apiGetJson } from '@/services/api';
import type { AuditFields, PageResult } from '@/services/api-types';

export type CourseStatus = 'ACTIVE' | 'DISABLED';

export interface CourseRecord extends AuditFields {
  name: string;
  description: string | null;
  status: CourseStatus;
}

export interface StudentCourseRecord extends AuditFields {
  studentId: string;
  courseId: string;
}

export interface ClassRuleRecord extends AuditFields {
  studentCourseId: string;
  startDate: string;
  intervalDays: number;
  endDate: string | null;
  startTime: string;
  endTime: string;
}

export async function listCourses(query: {
  page: number;
  pageSize: number;
  q?: string;
  status?: CourseStatus;
}) {
  return apiGetJson<PageResult<CourseRecord>>('courses', query);
}

export async function listStudentCourses(query: {
  page: number;
  pageSize: number;
  studentId?: string;
  courseId?: string;
}) {
  return apiGetJson<PageResult<StudentCourseRecord>>('student-courses', query);
}

export async function listClassRules(query: {
  page: number;
  pageSize: number;
  studentCourseId?: string;
}) {
  return apiGetJson<PageResult<ClassRuleRecord>>('class-rules', query);
}
