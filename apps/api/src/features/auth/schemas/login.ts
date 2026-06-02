import z from 'zod';
import type { User } from '@prisma-client';

export const emailLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(30),
});

export type EmailLoginInput = z.infer<typeof emailLoginSchema>;

export const phoneLoginSchema = z.object({
  phone: z.string().length(11),
  password: z.string().min(8).max(30),
});

export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>;

export const loginSchema = emailLoginSchema.or(phoneLoginSchema);

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginResponse = {
  user: Omit<User, 'passwordHash' | 'passwordSalt'>;
  token: string;
};
