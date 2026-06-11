import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z } from 'zod';

import { ApiError } from '@/shared/api-error';

export const zValidator = <T extends z.ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result) => {
    if (!result.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', result.error.issues);
    }
  });
