import { z } from 'zod';

export const classRuleFields = {
  studentCourseId: z.string().min(1, 'studentCourseId is required'),
  startDate: z.coerce.date(),
  intervalDays: z.coerce.number().int().min(1).nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'startTime must be in HH:mm or HH:mm:ss format'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'endTime must be in HH:mm or HH:mm:ss format'),
} as const;
