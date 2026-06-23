import { z } from 'zod';

import type { ClassRule } from '@tutorhub/database';

import { classRuleFields } from './class-rule';

export const classRuleCreateSchema = z.object({
  courseId: classRuleFields.courseId,
  startDate: classRuleFields.startDate,
  intervalDays: classRuleFields.intervalDays,
  endDate: classRuleFields.endDate,
  startTime: classRuleFields.startTime,
  endTime: classRuleFields.endTime,
  room: classRuleFields.room,
  studentIds: z.array(z.string().min(1)).min(1, 'At least one student is required'),
});

export type ClassRuleCreateResponse = ClassRule;
