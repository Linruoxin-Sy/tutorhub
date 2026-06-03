import type { User } from '@prisma-client';

export { registerSchema } from '@tutorhub/schema';

export type RegisterResponse = Omit<User, 'passwordHash' | 'passwordSalt'>;
