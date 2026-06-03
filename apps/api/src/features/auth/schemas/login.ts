import type { User } from '@prisma-client';

export { emailLoginSchema, phoneLoginSchema, loginSchema } from '@tutorhub/schema';

export type LoginResponse = {
  user: Omit<User, 'passwordHash' | 'passwordSalt'>;
  token: string;
};
