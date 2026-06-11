import { z } from 'zod';

import type { Course } from '@tutorhub/database';

import { courseFields } from './course';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const courseUpdateSchema = z
  .object({
    name: courseFields.name,
    description: preprocessNullable(courseFields.description),
    status: courseFields.status.optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Request body cannot be empty',
  });

export type CourseUpdateResponse = Course;
