import { z } from 'zod';

import type { ClassSession } from '@tutorhub/database';

import { classSessionFields } from './class-session';

export const classSessionUpdateParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const classSessionUpdateSchema = z
  .object({
    startTime: classSessionFields.startTime.optional(),
    endTime: classSessionFields.endTime.optional(),
    state: classSessionFields.state.optional(),
    rescheduledDate: classSessionFields.rescheduledDate.optional(),
    rescheduledStartTime: classSessionFields.rescheduledStartTime.optional(),
    rescheduledEndTime: classSessionFields.rescheduledEndTime.optional(),
    reason: classSessionFields.reason.optional(),
    room: classSessionFields.room.optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Request body cannot be empty',
  });

export type ClassSessionUpdateResponse = ClassSession;
