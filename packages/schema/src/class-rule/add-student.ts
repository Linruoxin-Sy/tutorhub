import { z } from 'zod';

import type { ClassRuleStudent } from '@tutorhub/database';

export const classRuleAddStudentSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
});

export type ClassRuleAddStudentResponse = ClassRuleStudent;
