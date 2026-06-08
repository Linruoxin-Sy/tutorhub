import { z } from 'zod';
import type { Student } from '@tutorhub/database';

export const studentDetailParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type StudentDetailResponse = Student & { avatarUrl: string | null };
