import { z } from 'zod';
import type { Course } from '@tutorhub/database';

export const courseDetailParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type CourseDetailResponse = Course;
