import { z } from 'zod';

import type { ClassRule } from '@tutorhub/database';

import { classRuleFields } from './class-rule';

export const classRuleUpdateParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const classRuleUpdateSchema = z
  .object({
    name: classRuleFields.name.optional(),
    price: classRuleFields.price.optional(),
    startDate: classRuleFields.startDate.optional(),
    intervalDays: classRuleFields.intervalDays,
    endDate: classRuleFields.endDate,
    startTime: classRuleFields.startTime.optional(),
    endTime: classRuleFields.endTime.optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Request body cannot be empty',
  });

export type ClassRuleUpdateResponse = ClassRule;
