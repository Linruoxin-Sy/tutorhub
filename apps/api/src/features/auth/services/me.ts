import { z } from 'zod';

import type { safeUser, updateMeSchema } from '@tutorhub/schema';

import { registerService } from '@/features/auth/services/register';
import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export const meService = {
  /** 获取当前用户信息（脱敏） */
  async getMe(userId: string): Promise<safeUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return registerService.safetifyUser(user);
  },

  /** 更新当前用户偏好（目前仅货币） */
  async updateMe(userId: string, input: z.infer<typeof updateMeSchema>): Promise<safeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { currency: input.currency },
    });
    return registerService.safetifyUser(user);
  },
};
