import { z } from 'zod';

import type { Student } from '@tutorhub/database';

import { studentFields } from './student';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const studentUpdateSchema = z
  .object({
    name: studentFields.name,
    avatarKey: studentFields.avatarKey.optional(),
    email: preprocessNullable(studentFields.email),
    phone: preprocessNullable(studentFields.phone),
    description: preprocessNullable(studentFields.description),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Request body cannot be empty',
  });

export type StudentUpdateResponse = Omit<Student, 'avatarKey'> & { avatarUrl: string | null };
