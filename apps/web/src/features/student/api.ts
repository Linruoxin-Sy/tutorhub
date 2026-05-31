import { apiGetJson } from '@/services/api';
import type { AuditFields, PageResult } from '@/services/api-types';

export interface StudentRecord extends AuditFields {
  userId: string;
  name: string;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  grade: string | null;
  description: string | null;
}

export interface UserRecord extends AuditFields {
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export async function listStudents(query: {
  page: number;
  pageSize: number;
  userId?: string;
  q?: string;
}) {
  return apiGetJson<PageResult<StudentRecord>>('students', query);
}

export async function listUsers(query: { page: number; pageSize: number; q?: string }) {
  return apiGetJson<PageResult<UserRecord>>('users', query);
}
