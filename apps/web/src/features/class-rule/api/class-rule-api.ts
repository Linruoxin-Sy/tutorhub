import type {
  ClassRuleConflictCheckRequest,
  ClassRuleConflictCheckResponse,
  ClassRuleListResponse,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

/** 根据选课关系 ID 查询上课规则列表（offset 分页） */
export async function fetchClassRules(
  studentCourseId: string,
  params: {
    offset?: number;
    limit?: number;
  },
): Promise<ClassRuleListResponse> {
  const { data } = await request.get<ClassRuleListResponse>('/class-rule/list', {
    params: { studentCourseId, ...params },
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
  studentCourseId: string,
  payload: ClassRuleConflictCheckRequest,
): Promise<ClassRuleConflictCheckResponse> {
  const { data } = await request.post<ClassRuleConflictCheckResponse>(
    `/class-rule/check-conflicts/${studentCourseId}`,
    payload,
  );
  return data;
}

/** 获取上课规则的所有调课覆盖记录 */
export async function fetchClassRuleOverrides(id: string): Promise<Record<string, unknown>[]> {
  const { data } = await request.get<{ data: Record<string, unknown>[] }>(
    `/class-rule/${id}/overrides`,
  );
  return data.data;
}

/** 删除上课规则（软删除） */
export async function deleteClassRule(id: string): Promise<void> {
  await request.delete(`/class-rule/${id}`);
}
