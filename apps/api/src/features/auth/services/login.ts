import { z } from 'zod';

import type { User } from '@tutorhub/database';
import type { emailLoginSchema, phoneLoginSchema, safeUser } from '@tutorhub/schema';

import { TokenService } from '@/features/auth/services/jwt';
import { passwordService } from '@/features/auth/services/password';
import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export interface LoginResult {
  user: safeUser;
  accessToken: string;
  refreshToken: string;
}

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

    return loginService.generateTokens(user);
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

    return loginService.generateTokens(user);
  },

  /** 生成双 Token 并持久化 Refresh Token 哈希 */
  async generateTokens(user: User): Promise<LoginResult> {
    const accessToken = await TokenService.signAccessToken({ userId: user.id });
    const refreshToken = await TokenService.generateRefreshToken();
    const refreshTokenHash = TokenService.hashRefreshToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    const safeUser = await loginService.safetifyUser(user);

    return { user: safeUser, accessToken, refreshToken };
  },
  async verifyPassword(password: string, salt: string, passwordHash: string) {
    const matched = await passwordService.verify(password, salt, passwordHash);

    if (!matched) {
      throw new ApiError(401, 'the password is incorrect');
    }
  },
  async safetifyUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, passwordSalt, refreshTokenHash, ...safeUser } = user;
    return safeUser;
  },
};
