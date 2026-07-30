import { Hono } from 'hono';

import {
  loginSchema,
  registerSchema,
  type LoginResponse,
  type RefreshResponse,
  type RegisterResponse,
} from '@tutorhub/schema';

import { TokenService } from '@/features/auth/services/jwt';
import { loginService } from '@/features/auth/services/login';
import { refreshService } from '@/features/auth/services/refresh';
import { registerService } from '@/features/auth/services/register';
import { ApiError } from '@/shared/api-error';
import { zValidator } from '@/shared/validator';

/** 生成 Refresh Token 的 Set-Cookie 响应头值 */
function buildRefreshCookie(token: string, maxAge: number): string {
  const parts = [
    `refreshToken=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAge}`,
  ];
  // 生产环境附加 Secure 标志
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/** 清除 Refresh Token Cookie */
function buildClearCookie(): string {
  return 'refreshToken=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
}

/** 从 Cookie 头中提取 refreshToken */
function extractRefreshToken(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)refreshToken=([^;]+)/);
  return match?.[1] ?? null;
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
    const maxAge = TokenService.getRefreshTokenExpiresDays() * 24 * 60 * 60;

    const res: LoginResponse = { user, accessToken };

    return c.json(res, 200, {
      'Set-Cookie': buildRefreshCookie(refreshToken, maxAge),
    });
  })
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const input = c.req.valid('json');

    const res: RegisterResponse = await registerService.register(input);

    return c.json(res);
  })
  .post('/refresh', async (c) => {
    const oldRefreshToken = extractRefreshToken(c.req.header('Cookie'));

    if (!oldRefreshToken) {
      throw new ApiError(401, 'REFRESH_TOKEN_MISSING', 'No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshService.refresh(oldRefreshToken);
    const maxAge = TokenService.getRefreshTokenExpiresDays() * 24 * 60 * 60;

    const res: RefreshResponse = { accessToken };

    return c.json(res, 200, {
      'Set-Cookie': buildRefreshCookie(newRefreshToken, maxAge),
    });
  })
  .post('/logout', async (c) => {
    const refreshToken = extractRefreshToken(c.req.header('Cookie'));

    if (refreshToken) {
      await refreshService.logoutByToken(refreshToken);
    }

    // 无论是否找到用户，都清除 Cookie
    return c.json({ message: 'Logged out' }, 200, {
      'Set-Cookie': buildClearCookie(),
    });
  });
