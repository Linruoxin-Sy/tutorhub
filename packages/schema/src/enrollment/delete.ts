import { z } from 'zod';

import type { StudentCourse } from '@tutorhub/database';

export const enrollmentDeleteParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type EnrollmentDeleteResponse = StudentCourse;
