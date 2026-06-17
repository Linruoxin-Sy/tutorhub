import { z } from 'zod';

import type { ClassRule } from '@tutorhub/database';

export const classRuleDeleteParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type ClassRuleDeleteResponse = ClassRule;
