import { Hono } from 'hono';

import type { CurrencyRatesResponse } from '@tutorhub/schema';

import { toCurrencyRatesResponse } from '@/shared/currency';

export const currencyRoute = new Hono().get('/rates', async (c) => {
  const res: CurrencyRatesResponse = toCurrencyRatesResponse();
  return c.json(res);
});
