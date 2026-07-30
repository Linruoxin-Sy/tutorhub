import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';
import ms from 'ms';

import { getEnv } from '@/shared/getEnv';

const JWT_SECRET = getEnv('JWT_SECRET');
const ACCESS_TOKEN_EXPIRES = getEnv('ACCESS_TOKEN_EXPIRES', '15m') as jwt.SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES = getEnv('REFRESH_TOKEN_EXPIRES', '30d');

export interface AccessTokenPayload {
  userId: string;
  jti: string;
}

export const TokenService = {
  /** 签发 Access Token（JWT，15 分钟） */
  async signAccessToken(payload: { userId: string }) {
    const jti = randomBytes(16).toString('hex');
    return jwt.sign({ ...payload, jti }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
  },

  /** 验证 Access Token */
  async verifyAccessToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  },

  /** 生成 Refresh Token（高强度随机字符串，30 天） */
  async generateRefreshToken(): Promise<string> {
    return randomBytes(32).toString('hex');
  },

  /** 计算 Refresh Token 的 SHA-256 哈希（用于服务端存储和比对） */
  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  },

  /** 获取 Refresh Token 的 Cookie Max-Age（秒），基于 ms 格式字符串解析 */
  getRefreshTokenMaxAge(): number {
    return Math.floor(ms(REFRESH_TOKEN_EXPIRES as ms.StringValue) / 1000);
  },
};
