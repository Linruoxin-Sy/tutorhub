import { z } from 'zod';

import type { ClassSessionOverride } from '@tutorhub/database';

import { classSessionOverrideFields } from './class-session';

export const classSessionOverrideUpdateParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const classSessionOverrideUpdateSchema = z
  .object({
    state: classSessionOverrideFields.state.optional(),
    rescheduledDate: classSessionOverrideFields.rescheduledDate.optional(),
    rescheduledStartTime: classSessionOverrideFields.rescheduledStartTime.optional(),
    rescheduledEndTime: classSessionOverrideFields.rescheduledEndTime.optional(),
    reason: classSessionOverrideFields.reason.optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Request body cannot be empty',
  });

export type ClassSessionOverrideUpdateResponse = ClassSessionOverride;
