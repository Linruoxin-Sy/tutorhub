import { z } from 'zod';

import type { ClassRule } from '@tutorhub/database';

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

export type ClassRuleListResponse = {
  items: ClassRule[];
  nextCursor: string | null;
  total: number;
};
