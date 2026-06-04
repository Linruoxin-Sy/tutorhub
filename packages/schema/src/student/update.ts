import { z } from 'zod';
import { Student } from '@tutorhub/database';
import { studentFields } from './student';

const preprocessNullable = (schema: z.ZodType<string | null>) =>
  z.preprocess((val) => (typeof val === 'string' && val === '' ? null : val), schema);

export const studentUpdateSchema = z
  .object({
    name: studentFields.name,
    avatarUrl: preprocessNullable(studentFields.avatarUrl),
    email: preprocessNullable(studentFields.email),
    phone: preprocessNullable(studentFields.phone),
    grade: preprocessNullable(studentFields.grade),
    description: preprocessNullable(studentFields.description),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'Request body cannot be empty',
  });

export type StudentUpdateResponse = Student;
