import { Hono } from 'hono';

import {
  courseEnrollmentListParamsSchema,
  enrollmentListQuerySchema,
  studentEnrollmentListParamsSchema,
  type CourseEnrollmentListResponse,
  type StudentEnrollmentListResponse,
} from '@tutorhub/schema';

import { enrollmentService } from '@/features/enrollment/services/enrollment';
import { zValidator } from '@/shared/validator';

export const enrollmentRoute = new Hono()
  .get(
    '/student/:studentId/enrollment/list',
    zValidator('param', studentEnrollmentListParamsSchema),
    zValidator('query', enrollmentListQuerySchema),
    async (c) => {
      const { studentId } = c.req.valid('param');
      const query = c.req.valid('query');
      const userId = c.get('userId');
      const res: StudentEnrollmentListResponse = await enrollmentService.listByStudent(
        studentId,
        query,
        userId,
      );
      return c.json(res);
    },
  )
  .get(
    '/course/:courseId/enrollment/list',
    zValidator('param', courseEnrollmentListParamsSchema),
    zValidator('query', enrollmentListQuerySchema),
    async (c) => {
      const { courseId } = c.req.valid('param');
      const query = c.req.valid('query');
      const userId = c.get('userId');
      const res: CourseEnrollmentListResponse = await enrollmentService.listByCourse(
        courseId,
        query,
        userId,
      );
      return c.json(res);
    },
  );
