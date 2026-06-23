import { z } from 'zod';

import type { ClassSession } from '@tutorhub/database';

export const classSessionDetailParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type ClassSessionDetailResponse = ClassSession & {
  classRule: { startTime: Date; endTime: Date; intervalDays?: number | null; room?: string | null };
  course: { id: string; name: string };
  participants: {
    id: string;
    student: { id: string; name: string; avatarUrl?: string | null };
  }[];
};
