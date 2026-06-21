import { z } from 'zod';

/** 冲突检测请求 */
export const classRuleConflictCheckSchema = z.object({
  /** 要排除的规则 ID（编辑时传，创建时不传） */
  excludeId: z.string().optional(),
  startDate: z.coerce.date(),
  intervalDays: z.coerce.number().int().min(1).nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'startTime must be in HH:mm or HH:mm:ss format'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'endTime must be in HH:mm or HH:mm:ss format'),
});

export type ClassRuleConflictCheckRequest = z.infer<typeof classRuleConflictCheckSchema>;

/** 冲突的课程信息 */
export type ConflictItem = {
  /** 发生冲突的日期 */
  date: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 冲突的规则 ID */
  ruleId: string;
};

/** 冲突检测响应 */
export type ClassRuleConflictCheckResponse = {
  hasConflict: boolean;
  /** 最近的 N 个冲突课程 */
  conflicts: ConflictItem[];
};
