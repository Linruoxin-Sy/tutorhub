import { z } from 'zod';

import { currencySchema } from '../currency';

export const classRuleFields = {
  courseId: z.string().min(1, 'courseId is required'),
  startDate: z.coerce.date(),
  intervalDays: z.coerce.number().int().min(1).nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  name: z.string().min(1).max(100),
  price: z.coerce.number().nonnegative(),
  currency: currencySchema.default('CNY'),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'startTime must be in HH:mm or HH:mm:ss format'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'endTime must be in HH:mm or HH:mm:ss format'),
} as const;
