import { http, HttpResponse } from 'msw';

import { mockDashboard } from '../factories';

export const dashboardHandlers = [
  // GET /api/v1/dashboard/
  http.get('*/api/v1/dashboard/', () => {
    return HttpResponse.json({ data: mockDashboard() });
  }),
];
