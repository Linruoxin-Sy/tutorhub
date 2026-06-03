import { Hono } from 'hono';
import { loginSchema, type LoginResponse, registerSchema } from '@tutorhub/schema';
import { zValidator } from '@/shared/validator';
import { loginService } from '@/features/auth/services/login';
import { ApiError } from '@/shared/api-error';
import { registerService } from '@/features/auth/services/register';

export const authRoute = new Hono()
  .post('/login', zValidator('json', loginSchema), async (c) => {
    const input = c.req.valid('json');

    let res: LoginResponse;

    if ('email' in input) {
      res = await loginService.loginWithEmail(input);
    } else if ('phone' in input) {
      res = await loginService.loginWithPhone(input);
    } else {
      throw new ApiError(400, 'invalid login input');
    }
    return c.json(res);
  })
  .post('/register', zValidator('json', registerSchema), async (c) => {
    const input = c.req.valid('json');

    const res = await registerService.register(input);

    return c.json(res);
  });
