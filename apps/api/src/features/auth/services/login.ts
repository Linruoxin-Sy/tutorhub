import z from 'zod';
import type { emailLoginSchema, phoneLoginSchema } from '@/features/auth/schemas/login';
import { JWTService } from '@/features/auth/services/jwt';
import { passwordService } from '@/features/auth/services/password';
import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import type { User } from '@prisma-client';

export const loginService = {
  async loginWithEmail(input: z.infer<typeof emailLoginSchema>) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, 'the email is not registered');
    }

    await loginService.verifyPassword(password, user.passwordSalt, user.passwordHash);

    const token = await JWTService.signAccessToken({ userId: user.id });

    const safeUser = await loginService.safetifyUser(user);

    return { user: safeUser, token };
  },
  async loginWithPhone(input: z.infer<typeof phoneLoginSchema>) {
    const { phone, password } = input;

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new ApiError(401, 'the phone number is not registered');
    }

    await loginService.verifyPassword(password, user.passwordSalt, user.passwordHash);

    const token = await JWTService.signAccessToken({ userId: user.id });

    const safeUser = await loginService.safetifyUser(user);

    return { user: safeUser, token };
  },
  async verifyPassword(password: string, salt: string, passwordHash: string) {
    const matched = await passwordService.verify(password, salt, passwordHash);

    if (!matched) {
      throw new ApiError(401, 'the password is incorrect');
    }
  },
  async safetifyUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  },
};
