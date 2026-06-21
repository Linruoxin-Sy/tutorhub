import { z } from 'zod';

import type { ClassRule, Course, Student } from '@tutorhub/database';

export const classRuleListQuerySchema = z.object({
  studentCourseId: z.string().min(1, 'studentCourseId is required'),
  offset: z.coerce.number().int().min(0).optional(),
  limit: z
    .string()
    .default('20')
    .transform((val) => {
      const parsed = Number.parseInt(val, 10);
      if (!Number.isFinite(parsed) || parsed < 1) return 20;
      return Math.min(parsed, 100);
    }),
});

/** 与 student list 单个 item 相同接口 */
type ClassRuleStudentItem = Omit<Student, 'avatarKey'> & { avatarUrl: string | null };

/** class-rule 列表项：包含学生和课程信息 */
export type ClassRuleListItem = ClassRule & {
  studentCourse: {
    student: ClassRuleStudentItem;
    course: Course;
  };
};

export type ClassRuleListResponse = {
  items: ClassRuleListItem[];
  nextCursor: string | null;
  total: number;
};
