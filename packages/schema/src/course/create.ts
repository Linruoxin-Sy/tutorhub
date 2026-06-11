import { z } from 'zod';
import { courseFields } from './course';
import type { Course } from '@tutorhub/database';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const courseCreateSchema = z.object({
  name: courseFields.name,
  description: preprocessNullable(courseFields.description),
  status: courseFields.status.optional(),
});

export type CourseCreateResponse = Course;
