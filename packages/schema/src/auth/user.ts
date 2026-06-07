import type { User } from '@tutorhub/database';

export type safeUser = Omit<User, 'passwordHash' | 'passwordSalt'>;
