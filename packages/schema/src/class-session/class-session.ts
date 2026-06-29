import { z } from 'zod';

export const classSessionOverrideFields = {
  classRuleId: z.string().min(1, 'classRuleId is required'),
  originalDate: z.coerce.date(),
  state: z.enum(['CANCELLED', 'RESCHEDULED']),
  rescheduledDate: z.coerce.date().nullable(),
  rescheduledStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'rescheduledStartTime must be in HH:mm or HH:mm:ss format')
    .nullable(),
  rescheduledEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'rescheduledEndTime must be in HH:mm or HH:mm:ss format')
    .nullable(),
  priceOverride: z.coerce.number().nonnegative().nullable(),
  reason: z.string().nullable(),
} as const;
