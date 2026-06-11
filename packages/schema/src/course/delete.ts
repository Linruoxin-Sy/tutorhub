import { z } from 'zod';

import type { Course } from '@tutorhub/database';

export const courseDeleteParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type CourseDeleteResponse = Course;
