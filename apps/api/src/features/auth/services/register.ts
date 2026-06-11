import { z } from 'zod';

import type { User } from '@tutorhub/database';
import type { registerSchema } from '@tutorhub/schema';

import { passwordService } from '@/features/auth/services/password';
import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export const registerService = {
  async register(input: z.infer<typeof registerSchema>) {
    const { name, email, phone, password } = input;

    if (!email && !phone) {
      throw new ApiError(400, 'either email or phone number must be provided');
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      throw new ApiError(409, 'user with this email or phone already exists');
    }

    const salt = await passwordService.generateSalt();
    const passwordHash = await passwordService.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordSalt: salt,
        passwordHash,
      },
    });
    return await registerService.safetifyUser(user);
  },
  async safetifyUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  },
};
