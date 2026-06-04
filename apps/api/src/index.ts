import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ApiError } from '@/shared/api-error';
import { authMiddleware } from '@/features/auth/middlewares/auth';
import { classRuleRoute } from '@/features/class-rules/class-rule.route';
import { classSessionRoute } from '@/features/class-sessions/class-session.route';
import { courseRoute } from '@/features/courses/course.route';
import { leaveRecordRoute } from '@/features/leave-records/leave-record.route';
import { rescheduleRecordRoute } from '@/features/reschedule-records/reschedule-record.route';
import { studentCourseRoute } from '@/features/student-courses/student-course.route';
import { studentRoute } from '@/features/student/routes';
import { authRoute } from '@/features/auth/routes';

const publicApi = new Hono()
  .get('/', (c) => c.json({ data: { name: 'TutorHub API', version: 'v1' } }))
  .route('/auth', authRoute);

const protectedApi = new Hono()
  .use(authMiddleware)
  .route('/student', studentRoute)
  .route('/courses', courseRoute)
  .route('/student-courses', studentCourseRoute)
  .route('/class-sessions', classSessionRoute)
  .route('/class-rules', classRuleRoute)
  .route('/leave-records', leaveRecordRoute)
  .route('/reschedule-records', rescheduleRecordRoute);

const app = new Hono()
  .use('*', cors())
  .route('/api/v1', publicApi)
  .route('/api/v1', protectedApi)
  .onError((error, c) => {
    if (error instanceof ApiError) {
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details ?? null,
          },
        },
        error.status as ContentfulStatusCode,
      );
    }

    console.error(error);

    return c.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal Server Error',
          details: null,
        },
      },
      500 as ContentfulStatusCode,
    );
  })
  .notFound((c) =>
    c.json(
      { error: { code: 'NOT_FOUND', message: 'Not Found', details: null } },
      404 as ContentfulStatusCode,
    ),
  );

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT ?? 3000),
  },
  (info) => {
    console.log(`Server is running on port: ${info.port}`);
  },
);

export type AppType = typeof app;
