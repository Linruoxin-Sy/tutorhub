import { z } from 'zod';
import { studentFields } from './student';
import { Student } from '@tutorhub/database';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const studentCreateSchema = z.object({
  name: studentFields.name,
  avatarUrl: preprocessNullable(studentFields.avatarUrl),
  email: preprocessNullable(studentFields.email),
  phone: preprocessNullable(studentFields.phone),
  grade: preprocessNullable(studentFields.grade),
  description: preprocessNullable(studentFields.description),
});

export type StudentCreateResponse = Student;
