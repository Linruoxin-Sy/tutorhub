import { Hono } from 'hono';

import type { DashboardResponse } from '@tutorhub/schema';

import { dashboardService } from '@/features/dashboard/services/dashboard';

export const dashboardRoute = new Hono().get('/', async (c) => {
  const userId = c.get('userId');
  const res: DashboardResponse = await dashboardService.getDashboard(userId);
  return c.json(res);
});
