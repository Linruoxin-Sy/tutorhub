import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

import {
  loginSchema,
  registerSchema,
  updateMeSchema,
  type LoginResponse,
  type MeResponse,
  type RefreshResponse,
  type RegisterResponse,
} from '@tutorhub/schema';

import { TokenService } from '@/features/auth/services/jwt';
import { loginService } from '@/features/auth/services/login';
import { meService } from '@/features/auth/services/me';
import { refreshService } from '@/features/auth/services/refresh';
import { registerService } from '@/features/auth/services/register';
import { ApiError } from '@/shared/api-error';
import { zValidator } from '@/shared/validator';

/** 设置 Refresh Token Cookie */
function setRefreshCookie(c: Parameters<typeof setCookie>[0], token: string, maxAge: number): void {
  setCookie(c, 'refreshToken', token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge,
    secure: process.env.NODE_ENV === 'production',
  });
}

export const authRoute = new Hono()
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const input = c.req.valid('json');

    let result: Awaited<ReturnType<typeof loginService.loginWithEmail>>;

    if ('email' in input) {
      result = await loginService.loginWithEmail(input);
    } else if ('phone' in input) {
      result = await loginService.loginWithPhone(input);
    } else {
      throw new ApiError(400, 'invalid login input');
    }

    const { user, accessToken, refreshToken } = result;
    const maxAge = TokenService.getRefreshTokenMaxAge();

    setRefreshCookie(c, refreshToken, maxAge);

    const res: LoginResponse = { user, accessToken };
    return c.json(res, 200);
  })
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const input = c.req.valid('json');

    const res: RegisterResponse = await registerService.register(input);

    return c.json(res);
  })
  .post('/refresh', async (c) => {
    const oldRefreshToken = getCookie(c, 'refreshToken');

    if (!oldRefreshToken) {
      throw new ApiError(401, 'REFRESH_TOKEN_MISSING', 'No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshService.refresh(oldRefreshToken);
    const maxAge = TokenService.getRefreshTokenMaxAge();

    setRefreshCookie(c, newRefreshToken, maxAge);

    const res: RefreshResponse = { accessToken };
    return c.json(res, 200);
  })
  .post('/logout', async (c) => {
    const token = getCookie(c, 'refreshToken');

    if (token) {
      await refreshService.logoutByToken(token);
    }

    deleteCookie(c, 'refreshToken');
    return c.json({ message: 'Logged out' });
  });

/** 需要鉴权的用户信息路由（挂到 protectedApi，由 authMiddleware 保护） */
export const authProtectedRoute = new Hono()
  .get('/me', async (c) => {
    const userId = c.get('userId');
    const res: MeResponse = await meService.getMe(userId);
    return c.json(res);
  })
  .patch('/me', zValidator('json', updateMeSchema), async (c) => {
    const userId = c.get('userId');
    const input = c.req.valid('json');
    const res: MeResponse = await meService.updateMe(userId, input);
    return c.json(res);
  });
