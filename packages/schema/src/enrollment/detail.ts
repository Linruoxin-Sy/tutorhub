import { z } from 'zod';

import type { Course, Student, StudentCourse } from '@tutorhub/database';

export const enrollmentDetailParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type EnrollmentDetailResponse = StudentCourse & {
  student: Student;
  course: Course;
};
