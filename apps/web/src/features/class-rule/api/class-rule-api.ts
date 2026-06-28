import type {
  ClassRuleAddStudentResponse,
  ClassRuleAvailableStudentsResponse,
  ClassRuleConflictCheckRequest,
  ClassRuleConflictCheckResponse,
  ClassRuleListResponse,
  ClassRuleRemoveStudentResponse,
  ClassRuleStudentListResponse,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

/** 查询上课规则列表（offset 分页），courseId 为空时查出当前用户所有规则 */
export async function fetchClassRules(
  courseId: string | undefined,
  params: {
    offset?: number;
    limit?: number;
  },
): Promise<ClassRuleListResponse> {
  const { data } = await request.get<ClassRuleListResponse>('/class-rule/list', {
    params: { ...(courseId ? { courseId } : {}), ...params },
  });
  return data;
}

/** 获取单个上课规则详情 */
export async function fetchClassRuleById(id: string): Promise<Record<string, unknown>> {
  const { data } = await request.get<{ data: Record<string, unknown> }>(`/class-rule/${id}`);
  return data.data;
}

/** 创建上课规则 */
export async function createClassRule(
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data } = await request.post<{ data: Record<string, unknown> }>('/class-rule', payload);
  return data.data;
}

/** 更新上课规则 */
export async function updateClassRule(
  id: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data } = await request.put<{ data: Record<string, unknown> }>(
    `/class-rule/${id}`,
    payload,
  );
  return data.data;
}

/** 冲突检测 */
export async function checkClassRuleConflicts(
  payload: ClassRuleConflictCheckRequest,
): Promise<ClassRuleConflictCheckResponse> {
  const { data } = await request.post<ClassRuleConflictCheckResponse>(
    '/class-rule/check-conflicts',
    payload,
  );
  return data;
}

/** 预览规则变更 */
export async function previewClassRuleChanges(
  id: string,
): Promise<{ toDelete: number; toCreate: number; hasConflict: boolean; conflicts: unknown[] }> {
  const res = await request.get<{
    toDelete: number;
    toCreate: number;
    hasConflict: boolean;
    conflicts: unknown[];
  }>(`/class-rule/${id}/preview`);
  return res.data;
}

/** 应用规则变更（删除未来 Session 并重新生成） */
export async function applyClassRuleChanges(
  id: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data } = await request.post<{ data: Record<string, unknown> }>(
    `/class-rule/${id}/apply-changes`,
    payload,
  );
  return data.data;
}

/** 删除上课规则（软删除） */
export async function deleteClassRule(id: string): Promise<void> {
  await request.delete(`/class-rule/${id}`);
}

// ────────── ClassRuleStudent 相关 API ──────────

/** 获取上课规则下已添加的学生列表 */
export async function fetchClassRuleStudents(
  ruleId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
    name?: string;
  },
): Promise<ClassRuleStudentListResponse> {
  const { data } = await request.get<ClassRuleStudentListResponse>(
    `/class-rule/${ruleId}/students`,
    { params },
  );
  return data;
}

/** 获取上课规则的可选学生（该课程已选课但未加入此规则的学生） */
export async function fetchClassRuleAvailableStudents(
  ruleId: string,
  courseId: string,
  params: {
    cursor?: string;
    offset?: number;
    limit?: number;
    name?: string;
  },
): Promise<ClassRuleAvailableStudentsResponse> {
  const { data } = await request.get<ClassRuleAvailableStudentsResponse>(
    `/class-rule/${ruleId}/available-students`,
    { params: { courseId, ...params } },
  );
  return data;
}

/** 添加学生到上课规则 */
export async function addClassRuleStudent(
  ruleId: string,
  studentId: string,
): Promise<ClassRuleAddStudentResponse> {
  const { data } = await request.post<{ data: ClassRuleAddStudentResponse }>(
    `/class-rule/${ruleId}/student`,
    { studentId },
  );
  return data.data;
}

/** 从上课规则移除学生（软删除） */
export async function removeClassRuleStudent(id: string): Promise<ClassRuleRemoveStudentResponse> {
  const { data } = await request.delete<{ data: ClassRuleRemoveStudentResponse }>(
    `/class-rule-student/${id}`,
  );
  return data.data;
}
