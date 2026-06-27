import { z } from 'zod';

import type { ClassRule, Course } from '@tutorhub/database';

export const classRuleListQuerySchema = z.object({
  courseId: z.string().optional(),
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

/** class-rule 列表项：包含课程信息 */
export type ClassRuleListItem = ClassRule & {
  course: Pick<Course, 'id' | 'name' | 'status'>;
};

export type ClassRuleListResponse = {
  items: ClassRuleListItem[];
  nextCursor: string | null;
  total: number;
};
