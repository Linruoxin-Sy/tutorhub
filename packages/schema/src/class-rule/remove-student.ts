import { z } from 'zod';

import type { ClassRuleStudent } from '@tutorhub/database';

export const classRuleRemoveStudentParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type ClassRuleRemoveStudentResponse = ClassRuleStudent;
