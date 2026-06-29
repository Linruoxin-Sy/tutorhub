import { z } from 'zod';

import type { ClassSessionOverride } from '@tutorhub/database';

import { classSessionOverrideFields } from './class-session';

export const classSessionOverrideCreateSchema = z.object({
  classRuleId: classSessionOverrideFields.classRuleId,
  originalDate: classSessionOverrideFields.originalDate,
  state: classSessionOverrideFields.state,
  rescheduledDate: classSessionOverrideFields.rescheduledDate.optional(),
  rescheduledStartTime: classSessionOverrideFields.rescheduledStartTime.optional(),
  rescheduledEndTime: classSessionOverrideFields.rescheduledEndTime.optional(),
  priceOverride: classSessionOverrideFields.priceOverride.optional(),
  reason: classSessionOverrideFields.reason.optional(),
});

export type ClassSessionOverrideCreateResponse = ClassSessionOverride;
