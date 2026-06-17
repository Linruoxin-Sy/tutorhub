import type { ClassRuleListResponse } from '@tutorhub/schema';

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

/** 删除上课规则（软删除） */
export async function deleteClassRule(id: string): Promise<void> {
  await request.delete(`/class-rule/${id}`);
}
