import { z } from 'zod';

import type { Course, Student } from '@tutorhub/database';

export const availableCoursesQuerySchema = z.object({
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
});

export const availableStudentsQuerySchema = availableCoursesQuerySchema;

export type AvailableCoursesResponse = {
  items: Course[];
  nextCursor: string | null;
  total: number;
};

export type AvailableStudentsResponse = {
  items: Student[];
  nextCursor: string | null;
  total: number;
};
