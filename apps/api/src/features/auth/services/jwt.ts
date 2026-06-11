import jwt from 'jsonwebtoken';

import { getEnv } from '@/shared/getEnv';

const JWT_SECRET = getEnv('JWT_SECRET');
const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', '7d') as jwt.SignOptions['expiresIn'];

export interface JwtPayload {
  userId: string;
}

export const JWTService = {
  async signAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  },
  async verifyAccessToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  },
};
