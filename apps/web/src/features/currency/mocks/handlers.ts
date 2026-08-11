import { http, HttpResponse } from 'msw';

export const currencyHandlers = [
  // GET /api/v1/currency/rates
  http.get('*/api/v1/currency/rates', () => {
    return HttpResponse.json({
      base: 'USD',
      rates: { CNY: 7.2, USD: 1 },
      updatedAt: new Date().toISOString(),
    });
  }),
];
