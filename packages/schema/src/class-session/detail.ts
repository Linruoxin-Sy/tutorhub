import { z } from 'zod';

import type { ClassSessionOverride } from '@tutorhub/database';

export const classSessionOverrideDetailParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type ClassSessionOverrideDetailResponse = ClassSessionOverride & {
  classRule: { startTime: Date; endTime: Date; intervalDays?: number | null };
};
