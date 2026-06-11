import type { MiddlewareHandler } from 'hono';

import { JWTService } from '@/features/auth/services/jwt';
import { ApiError } from '@/shared/api-error';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = await JWTService.verifyAccessToken(token);
    c.set('userId', payload.userId);
    await next();
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
};
