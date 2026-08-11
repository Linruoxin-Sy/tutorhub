import { Hono } from 'hono';

import { currencySchema, type DashboardResponse } from '@tutorhub/schema';

import { dashboardService } from '@/features/dashboard/services/dashboard';

export const dashboardRoute = new Hono().get('/', async (c) => {
  const userId = c.get('userId');
  const parsed = currencySchema.safeParse(c.req.query('currency') ?? 'CNY');
  const currency = parsed.success ? parsed.data : 'CNY';
  const res: DashboardResponse = await dashboardService.getDashboard(userId, currency);
  return c.json(res);
});
