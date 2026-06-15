import { z } from 'zod';

import type { Course, Student, StudentCourse } from '@tutorhub/database';

export const studentEnrollmentListParamsSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
});

export const courseEnrollmentListParamsSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
});

export const enrollmentListQuerySchema = z.object({
  cursor: z.string().optional(),
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

export type StudentEnrollmentListResponse = {
  items: (StudentCourse & { course: Course })[];
  nextCursor: string | null;
  total: number;
};

export type CourseEnrollmentListResponse = {
  items: (StudentCourse & { student: Student })[];
  nextCursor: string | null;
  total: number;
};
