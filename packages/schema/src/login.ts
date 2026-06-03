import z from 'zod';

export const emailLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(30),
});

export const phoneLoginSchema = z.object({
  phone: z.string().length(11),
  password: z.string().min(8).max(30),
});

export const loginSchema = z.union([emailLoginSchema, phoneLoginSchema]);
