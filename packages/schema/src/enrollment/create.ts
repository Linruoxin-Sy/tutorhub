import { z } from 'zod';

import type { StudentCourse } from '@tutorhub/database';

export const enrollmentCreateSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  courseId: z.string().min(1, 'courseId is required'),
});

export type EnrollmentCreateResponse = StudentCourse;
