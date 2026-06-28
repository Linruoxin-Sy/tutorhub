import { z } from 'zod';

import type { ClassRuleStudent, Student } from '@tutorhub/database';

export const classRuleStudentListParamsSchema = z.object({
  ruleId: z.string().min(1, 'ruleId is required'),
});

export const classRuleStudentListQuerySchema = z.object({
  cursor: z.string().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  limit: z
    .string()
    .default('20')
    .transform((val) => {
      const parsed = Number.parseInt(val, 10);
      if (!Number.isFinite(parsed) || parsed < 1) return 20;
      return Math.min(parsed, 100);
    }),
  name: z.string().optional(),
});

export type ClassRuleStudentListResponse = {
  items: (ClassRuleStudent & { student: Student })[];
  nextCursor: string | null;
  total: number;
};
