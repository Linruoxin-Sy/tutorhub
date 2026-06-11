import { z } from 'zod';

import type { Course } from '@tutorhub/database';

import { courseFields } from './course';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const courseCreateSchema = z.object({
  name: courseFields.name,
  description: preprocessNullable(courseFields.description),
  status: courseFields.status.optional(),
});

export type CourseCreateResponse = Course;
