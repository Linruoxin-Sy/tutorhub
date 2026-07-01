import { http, HttpResponse } from 'msw';

import { mockLoginResponse, mockRegisterResponse } from '../factories';

export const authHandlers = [
  // POST /api/v1/auth/login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { password } = body as {
      password?: string;
    };

    if (!password) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Password is required' } },
        { status: 422 },
      );
    }

    return HttpResponse.json({ data: mockLoginResponse() });
  }),

  // POST /api/v1/auth/register
  http.post('*/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { name, password } = body as { name?: string; password?: string };

    if (!name || !password) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name and password are required' } },
        { status: 422 },
      );
    }

    return HttpResponse.json({ data: mockRegisterResponse() }, { status: 201 });
  }),
];
