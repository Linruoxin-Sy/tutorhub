import { z } from 'zod';

import type { ClassSessionOverride } from '@tutorhub/database';

export const classSessionOverrideListQuerySchema = z.object({
  classRuleId: z.string().optional(),
  state: z.enum(['CANCELLED', 'RESCHEDULED']).optional(),
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

export type ClassSessionOverrideListItem = ClassSessionOverride;

export type ClassSessionOverrideListResponse = {
  items: ClassSessionOverrideListItem[];
  nextCursor: string | null;
  total: number;
};
