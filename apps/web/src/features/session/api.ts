import { apiGetJson } from '@/services/api';
import type { AuditFields, PageResult } from '@/services/api-types';

export interface ClassSessionRecord extends AuditFields {
  studentCourseId: string;
  classDate: string;
  startTime: string;
  endTime: string;
}

export interface LeaveRecord extends AuditFields {
  classSessionId: string;
  reason: string | null;
}

export interface RescheduleRecord extends AuditFields {
  originalSessionId: string;
  newSessionId: string;
  reason: string | null;
}

export async function listClassSessions(query: {
  page: number;
  pageSize: number;
  studentCourseId?: string;
  classDate?: string;
}) {
  return apiGetJson<PageResult<ClassSessionRecord>>('class-sessions', query);
}

export async function listLeaveRecords(query: {
  page: number;
  pageSize: number;
  classSessionId?: string;
}) {
  return apiGetJson<PageResult<LeaveRecord>>('leave-records', query);
}

export async function listRescheduleRecords(query: {
  page: number;
  pageSize: number;
  originalSessionId?: string;
  newSessionId?: string;
}) {
  return apiGetJson<PageResult<RescheduleRecord>>('reschedule-records', query);
}
