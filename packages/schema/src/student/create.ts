import { z } from 'zod';
import { studentFields } from './student';
import type { Student } from '@tutorhub/database';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const studentCreateSchema = z.object({
  name: studentFields.name,
  avatarKey: z.string().nullable().optional(),
  email: preprocessNullable(studentFields.email),
  phone: preprocessNullable(studentFields.phone),
  description: preprocessNullable(studentFields.description),
});

export type StudentCreateResponse = Student & { avatarUrl: string | null };
