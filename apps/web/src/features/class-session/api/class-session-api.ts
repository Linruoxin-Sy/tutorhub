import type {
  ClassSessionOverrideConflictCheckRequest,
  ClassSessionOverrideConflictCheckResponse,
  ClassSessionOverrideCreateResponse,
  ClassSessionOverrideDetailResponse,
  ClassSessionOverrideListResponse,
  ClassSessionOverrideUpdateResponse,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

/** 分页查询课程实例变更记录 */
export async function fetchClassSessionOverrides(params: {
  classRuleId?: string;
  state?: string;
  offset?: number;
  limit?: number;
}): Promise<ClassSessionOverrideListResponse> {
  const { data } = await request.get<ClassSessionOverrideListResponse>('/class-session/list', {
    params,
  });
  return data;
}

/** 获取单条课程实例变更记录详情 */
export async function fetchClassSessionOverrideById(
  id: string,
): Promise<ClassSessionOverrideDetailResponse> {
  const { data } = await request.get<{ data: ClassSessionOverrideDetailResponse }>(
    `/class-session/${id}`,
  );
  return data.data;
}

/** 创建课程实例变更记录 */
export async function createClassSessionOverride(
  payload: Record<string, unknown>,
): Promise<ClassSessionOverrideCreateResponse> {
  const { data } = await request.post<{ data: ClassSessionOverrideCreateResponse }>(
    '/class-session',
    payload,
  );
  return data.data;
}

/** 更新课程实例变更记录 */
export async function updateClassSessionOverride(
  id: string,
  payload: Record<string, unknown>,
): Promise<ClassSessionOverrideUpdateResponse> {
  const { data } = await request.put<{ data: ClassSessionOverrideUpdateResponse }>(
    `/class-session/${id}`,
    payload,
  );
  return data.data;
}

/** 删除课程实例变更记录 */
export async function deleteClassSessionOverride(id: string): Promise<void> {
  await request.delete(`/class-session/${id}`);
}

/** 课程实例变更冲突检测 */
export async function checkClassSessionOverrideConflicts(
  payload: ClassSessionOverrideConflictCheckRequest,
): Promise<ClassSessionOverrideConflictCheckResponse> {
  const { data } = await request.post<ClassSessionOverrideConflictCheckResponse>(
    '/class-session/check-conflicts',
    payload,
  );
  return data;
}
