import { z } from 'zod';

import { currencySchema } from '../currency';
import type { safeUser } from './user';

/** 更新当前用户（货币偏好）入参 */
export const updateMeSchema = z.object({
  currency: currencySchema,
});

/** 当前用户信息响应 */
export type MeResponse = safeUser;
