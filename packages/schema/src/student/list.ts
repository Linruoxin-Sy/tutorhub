import { z } from 'zod';

import type { Student } from '@tutorhub/database';

export const studentListSchema = z.object({
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
});

export type StudentListResponse = {
  items: (Omit<Student, 'avatarKey'> & { avatarUrl: string | null })[];
  nextCursor: string | null;
  total: number;
};
