import { Hono } from 'hono';

import {
  availableCoursesQuerySchema,
  availableStudentsQuerySchema,
  courseEnrollmentListParamsSchema,
  enrollmentCreateSchema,
  enrollmentDeleteParamsSchema,
  enrollmentDetailParamsSchema,
  enrollmentListQuerySchema,
  studentEnrollmentListParamsSchema,
  type AvailableCoursesResponse,
  type AvailableStudentsResponse,
  type CourseEnrollmentListResponse,
  type EnrollmentDetailResponse,
  type StudentEnrollmentListResponse,
} from '@tutorhub/schema';

import { enrollmentService } from '@/features/enrollment/services/enrollment';
import { zValidator } from '@/shared/validator';

export const enrollmentRoute = new Hono()
  .get('/enrollment/:id', zValidator('param', enrollmentDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: EnrollmentDetailResponse = await enrollmentService.getById(id, userId);
    return c.json({ data: res });
  })
  .delete('/enrollment/:id', zValidator('param', enrollmentDeleteParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res = await enrollmentService.deleteById(id, userId);
    return c.json({ data: res });
  })
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
  )
  .get(
    '/student/:studentId/available-courses',
    zValidator('param', studentEnrollmentListParamsSchema),
    zValidator('query', availableCoursesQuerySchema),
    async (c) => {
      const { studentId } = c.req.valid('param');
      const query = c.req.valid('query');
      const userId = c.get('userId');
      const res: AvailableCoursesResponse = await enrollmentService.listAvailableCourses(
        studentId,
        query,
        userId,
      );
      return c.json(res);
    },
  )
  .get(
    '/course/:courseId/available-students',
    zValidator('param', courseEnrollmentListParamsSchema),
    zValidator('query', availableStudentsQuerySchema),
    async (c) => {
      const { courseId } = c.req.valid('param');
      const query = c.req.valid('query');
      const userId = c.get('userId');
      const res: AvailableStudentsResponse = await enrollmentService.listAvailableStudents(
        courseId,
        query,
        userId,
      );
      return c.json(res);
    },
  )
  .post('/enrollment', zValidator('json', enrollmentCreateSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res = await enrollmentService.create(input, userId);
    return c.json({ data: res }, 201);
  });
