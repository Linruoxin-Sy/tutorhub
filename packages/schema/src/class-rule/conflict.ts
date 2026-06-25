import { z } from 'zod';

/** 冲突检测请求 */
export const classRuleConflictCheckSchema = z.object({
  /** 要排除的规则 ID（编辑时传，创建时不传） */
  excludeId: z.string().optional(),
  /** 课程 ID（用于确定所属教师 User） */
  courseId: z.string().min(1, 'courseId is required'),
  startDate: z.coerce.date(),
  intervalDays: z.coerce.number().int().min(1).nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'startTime must be in HH:mm or HH:mm:ss format'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'endTime must be in HH:mm or HH:mm:ss format'),
  /** 教室（可选）：如果指定则检测同一教室时间冲突 */
  room: z.string().nullable().optional(),
});

export type ClassRuleConflictCheckRequest = z.infer<typeof classRuleConflictCheckSchema>;

/** 冲突类型 */
export type ConflictType = 'resource' | 'room';

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
  /** 冲突所属课程名称 */
  courseName: string;
  /** 该课程下已选课的学生名称列表 */
  studentNames: string[];
  /** 冲突类型 */
  type: ConflictType;
  /** 冲突描述 */
  description: string;
};

/** 冲突检测响应 */
export type ClassRuleConflictCheckResponse = {
  hasConflict: boolean;
  /** 最近的 N 个冲突课程 */
  conflicts: ConflictItem[];
};
