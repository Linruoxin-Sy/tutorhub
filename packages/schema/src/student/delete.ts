import { z } from 'zod';
import type { Student } from '@tutorhub/database';

export const studentDeleteParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type StudentDeleteResponse = Student & { avatarUrl: string | null };
