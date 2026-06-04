import { z } from 'zod';
import { Student } from '@tutorhub/database';

export const studentListSchema = z.object({
  cursor: z.string().optional(),
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
  items: Student[];
  nextCursor: string | null;
  hasMore: boolean;
};
