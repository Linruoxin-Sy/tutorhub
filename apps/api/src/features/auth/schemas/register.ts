import z from 'zod';
import type { User } from '@prisma-client';

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.email().optional(),
  phone: z.string().length(11).optional(),
  password: z.string().min(8).max(30),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterResponse = Omit<User, 'passwordHash' | 'passwordSalt'>;
