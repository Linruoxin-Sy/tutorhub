import { z } from 'zod';

import type { ConflictItem } from '../class-rule/conflict';

/** 课程实例变更冲突检测请求 */
export const classSessionOverrideConflictCheckSchema = z.object({
  /** 所属规则 ID */
  classRuleId: z.string().min(1, 'classRuleId is required'),
  /** 原始上课日期 */
  originalDate: z.coerce.date(),
  /** 调课后的新开始时间 */
  newStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'newStartTime must be in HH:mm or HH:mm:ss format'),
  /** 调课后的新结束时间 */
  newEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'newEndTime must be in HH:mm or HH:mm:ss format'),
});

export type ClassSessionOverrideConflictCheckRequest = z.infer<
  typeof classSessionOverrideConflictCheckSchema
>;

/** 课程实例变更冲突检测响应 */
export type ClassSessionOverrideConflictCheckResponse = {
  hasConflict: boolean;
  conflicts: ConflictItem[];
};
