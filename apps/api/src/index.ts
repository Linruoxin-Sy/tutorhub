import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { checkDatabaseConnection, prisma } from '@tutorhub/database';

import { authMiddleware } from '@/features/auth/middlewares/auth';
import { authRoute } from '@/features/auth/routes';
import { classRuleRoute } from '@/features/class-rule/routes';
import { classSessionRoute } from '@/features/class-session/routes';
import { courseRoute } from '@/features/course/routes';
import { dashboardRoute } from '@/features/dashboard/routes';
import { enrollmentRoute } from '@/features/enrollment/routes';
import { storageRoute } from '@/features/storage/routes';
import { studentRoute } from '@/features/student/routes';
import { ApiError } from '@/shared/api-error';
import { checkStorageConnection } from '@/shared/health';
import { retry } from '@/shared/retry';
import { bucketName, ensureBucket, s3Client } from '@/shared/s3';

const publicApi = new Hono()
  .get('/', (c) => c.json({ data: { name: 'TutorHub API', version: 'v1' } }))
  .get('/healthz', (c) => c.json({ status: 'ok' }))
  .route('/auth', authRoute);

const protectedApi = new Hono()
  .use(authMiddleware)
  .route('/storage', storageRoute)
  .route('/dashboard', dashboardRoute)
  .route('/course', courseRoute)
  .route('/student', studentRoute)
  .route('/class-rule', classRuleRoute)
  .route('/class-session', classSessionRoute)
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
async function startServer(): Promise<void> {
  // 1. 检查数据库连接（带重试）
  console.log('[startup] Checking database connection...');
  await retry(() => checkDatabaseConnection(prisma), { label: 'database' });
  console.log('[startup] ✅ Database connection OK');

  // 2. 检查对象存储连接（带重试）
  console.log('[startup] Checking storage connection...');
  await retry(() => checkStorageConnection(s3Client, bucketName), {
    label: 'storage',
  });
  console.log('[startup] ✅ Storage connection OK');

  // 3. 确保 MinIO bucket 已就绪
  await ensureBucket();

  // 4. 启动 HTTP 服务
  serve(
    {
      fetch: app.fetch,
      port: Number(process.env.PORT ?? 3000),
    },
    (info) => {
      console.log(`[startup] Server is running on port: ${info.port}`);
    },
  );
}

startServer().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[startup] ❌ Fatal: ${message}`);
  process.exit(1);
});

export type AppType = typeof app;
