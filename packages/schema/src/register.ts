import z from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  email: z.union([z.email('Invalid email address'), z.string().length(0)]),
  phone: z.union([
    z.string().length(11, 'Phone number must be 11 characters'),
    z.string().length(0),
  ]),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must be at most 20 characters'),
});
