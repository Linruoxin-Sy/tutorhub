import { z } from 'zod';

import type { ClassSession } from '@tutorhub/database';

export const classSessionListQuerySchema = z.object({
  courseId: z.string().optional(),
  classRuleId: z.string().optional(),
  /** 按日期范围筛选 */
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  state: z.enum(['SCHEDULED', 'COMPLETED', 'LEAVE', 'CANCELLED', 'RESCHEDULED']).optional(),
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

export type ClassSessionListItem = ClassSession & {
  classRule: { startTime: Date; endTime: Date; room?: string | null };
  course: { name: string };
};

export type ClassSessionListResponse = {
  items: ClassSessionListItem[];
  nextCursor: string | null;
  total: number;
};
