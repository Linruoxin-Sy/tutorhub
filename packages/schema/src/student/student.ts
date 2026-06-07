import { z } from 'zod';

export const studentFields = {
  userId: z.string().min(1, 'userId is required'),
  name: z.string().min(1, 'name is required').max(100, 'name must be at most 100 characters'),
  avatarUrl: z.url('Invalid URL').nullable(),
  email: z.email('Invalid email address').nullable(),
  phone: z.string().nullable(),
  description: z.string().nullable(),
} as const;
