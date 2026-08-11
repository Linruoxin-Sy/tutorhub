import { http, HttpResponse } from 'msw';

import { mockDashboard } from './factories';

export const dashboardHandlers = [
  // GET /api/v1/dashboard/
  http.get('*/api/v1/dashboard/', ({ request }) => {
    const url = new URL(request.url);
    const currency = url.searchParams.get('currency') === 'USD' ? 'USD' : 'CNY';
    return HttpResponse.json(mockDashboard({ currency }));
  }),
];
