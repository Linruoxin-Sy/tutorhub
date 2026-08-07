import { http, HttpResponse } from 'msw';

import { mockLoginResponse, mockRegisterResponse } from './factories';

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

    return HttpResponse.json(mockLoginResponse(), {
      headers: {
        'Set-Cookie':
          'refreshToken=mock-refresh-token; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000',
      },
    });
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

    return HttpResponse.json(mockRegisterResponse(), { status: 201 });
  }),

  // POST /api/v1/auth/refresh
  http.post('*/api/v1/auth/refresh', async () => {
    return HttpResponse.json(
      { accessToken: 'mock-refreshed-access-token' },
      {
        headers: {
          'Set-Cookie':
            'refreshToken=new-mock-refresh-token; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000',
        },
      },
    );
  }),

  // POST /api/v1/auth/logout
  http.post('*/api/v1/auth/logout', async () => {
    return HttpResponse.json(
      { message: 'Logged out' },
      {
        headers: { 'Set-Cookie': 'refreshToken=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' },
      },
    );
  }),
];
