import { z } from 'zod';

import type { ClassRule, Course } from '@tutorhub/database';

export const classRuleDetailParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type ClassRuleDetailResponse = ClassRule & {
  course: Pick<Course, 'id' | 'name'>;
};
