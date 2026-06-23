import { z } from 'zod';

export const classSessionFields = {
  classRuleId: z.string().min(1, 'classRuleId is required'),
  courseId: z.string().min(1, 'courseId is required'),
  occurrenceDate: z.coerce.date(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'startTime must be in HH:mm or HH:mm:ss format'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'endTime must be in HH:mm or HH:mm:ss format'),
  state: z
    .enum(['SCHEDULED', 'COMPLETED', 'LEAVE', 'CANCELLED', 'RESCHEDULED'])
    .default('SCHEDULED'),
  rescheduledDate: z.coerce.date().nullable(),
  rescheduledStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'rescheduledStartTime must be in HH:mm or HH:mm:ss format')
    .nullable(),
  rescheduledEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'rescheduledEndTime must be in HH:mm or HH:mm:ss format')
    .nullable(),
  reason: z.string().nullable(),
  room: z.string().nullable(),
} as const;
