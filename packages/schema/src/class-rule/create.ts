import { z } from 'zod';

import type { ClassRule } from '@tutorhub/database';

import { classRuleFields } from './class-rule';

export const classRuleCreateSchema = z.object({
  studentCourseId: classRuleFields.studentCourseId,
  startDate: classRuleFields.startDate,
  intervalDays: classRuleFields.intervalDays,
  endDate: classRuleFields.endDate,
  startTime: classRuleFields.startTime,
  endTime: classRuleFields.endTime,
});

export type ClassRuleCreateResponse = ClassRule;
