import type {
  ClassSessionCreateResponse,
  ClassSessionDetailResponse,
  ClassSessionListResponse,
  ClassSessionUpdateResponse,
} from '@tutorhub/schema';

import { request } from '@/utils/request';

/** 分页查询课程实例 */
export async function fetchClassSessions(params: {
  courseId?: string;
  classRuleId?: string;
  dateFrom?: string;
  dateTo?: string;
  state?: string;
  offset?: number;
  limit?: number;
}): Promise<ClassSessionListResponse> {
  const { data } = await request.get<ClassSessionListResponse>('/class-session/list', { params });
  return data;
}

/** 获取单条课程实例详情 */
export async function fetchClassSessionById(id: string): Promise<ClassSessionDetailResponse> {
  const { data } = await request.get<{ data: ClassSessionDetailResponse }>(`/class-session/${id}`);
  return data.data;
}

/** 创建课程实例（补课场景） */
export async function createClassSession(
  payload: Record<string, unknown>,
): Promise<ClassSessionCreateResponse> {
  const { data } = await request.post<{ data: ClassSessionCreateResponse }>(
    '/class-session',
    payload,
  );
  return data.data;
}

/** 更新课程实例（调课/请假/完成/取消） */
export async function updateClassSession(
  id: string,
  payload: Record<string, unknown>,
): Promise<ClassSessionUpdateResponse> {
  const { data } = await request.put<{ data: ClassSessionUpdateResponse }>(
    `/class-session/${id}`,
    payload,
  );
  return data.data;
}

/** 删除课程实例 */
export async function deleteClassSession(id: string): Promise<void> {
  await request.delete(`/class-session/${id}`);
}

/** 添加参与者 */
export async function addSessionParticipant(
  sessionId: string,
  studentId: string,
): Promise<Record<string, unknown>> {
  const { data } = await request.post<{ data: Record<string, unknown> }>(
    `/class-session/${sessionId}/participants`,
    { classSessionId: sessionId, studentId },
  );
  return data.data;
}

/** 移除参与者 */
export async function removeSessionParticipant(
  sessionId: string,
  participantId: string,
): Promise<void> {
  await request.delete(`/class-session/${sessionId}/participants/${participantId}`);
}
