import { TokenService } from '@/features/auth/services/jwt';
import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export const refreshService = {
  /** 刷新 Token：验证旧 Refresh Token → Rotation → 返回新双 Token */
  async refresh(oldRefreshToken: string) {
    const tokenHash = TokenService.hashRefreshToken(oldRefreshToken);

    const user = await prisma.user.findFirst({
      where: { refreshTokenHash: tokenHash },
    });

    if (!user) {
      throw new ApiError(401, 'REFRESH_TOKEN_INVALID', 'Invalid or expired refresh token');
    }

    // Rotation：生成新 Token，更新哈希，旧 Token 立即失效
    const accessToken = await TokenService.signAccessToken({ userId: user.id });
    const newRefreshToken = await TokenService.generateRefreshToken();
    const newTokenHash = TokenService.hashRefreshToken(newRefreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newTokenHash },
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  /** 登出：通过 Refresh Token 查找用户并清除哈希 */
  async logoutByToken(refreshToken: string) {
    const tokenHash = TokenService.hashRefreshToken(refreshToken);

    await prisma.user.updateMany({
      where: { refreshTokenHash: tokenHash },
      data: { refreshTokenHash: null },
    });
  },
};
