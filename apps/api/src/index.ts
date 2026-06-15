import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { authMiddleware } from '@/features/auth/middlewares/auth';
import { authRoute } from '@/features/auth/routes';
import { courseRoute } from '@/features/course/routes';
import { enrollmentRoute } from '@/features/enrollment/routes';
import { storageRoute } from '@/features/storage/routes';
import { studentRoute } from '@/features/student/routes';
import { ApiError } from '@/shared/api-error';
import { ensureBucket } from '@/shared/s3';

const publicApi = new Hono()
  .get('/', (c) => c.json({ data: { name: 'TutorHub API', version: 'v1' } }))
  .route('/auth', authRoute);

const protectedApi = new Hono()
  .use(authMiddleware)
  .route('/storage', storageRoute)
  .route('/course', courseRoute)
  .route('/student', studentRoute)
  .route('/', enrollmentRoute);

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

// 确保 MinIO bucket 存在
ensureBucket().catch((err) => console.error('Failed to ensure bucket:', err));

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
