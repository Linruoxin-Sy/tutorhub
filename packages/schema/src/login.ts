import { type User } from '@tutorhub/database';
import { z } from 'zod';

export const emailLoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const phoneLoginSchema = z.object({
  phone: z.string().length(11, 'Phone number must be 11 characters'),
  password: z.string().max(20, 'Password must be at most 20 characters'),
});

export const loginSchema = z.union([emailLoginSchema, phoneLoginSchema]);

export type LoginResponse = {
  user: Omit<User, 'passwordHash' | 'passwordSalt'>;
  token: string;
};
