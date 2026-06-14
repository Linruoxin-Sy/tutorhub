import { z } from 'zod';

import type { Course } from '@tutorhub/database';

export const courseListSchema = z.object({
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
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  studentId: z.string().optional(),
});

export type CourseListResponse = {
  items: Course[];
  nextCursor: string | null;
  total: number;
};
