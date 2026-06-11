import { z } from 'zod';

export const courseFields = {
  name: z.string().min(1, 'name is required').max(200, 'name must be at most 200 characters'),
  description: z.string().nullable(),
  status: z.enum(['ACTIVE', 'DISABLED']).default('ACTIVE'),
} as const;
