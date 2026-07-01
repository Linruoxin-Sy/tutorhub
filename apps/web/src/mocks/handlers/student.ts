import { http, HttpResponse } from 'msw';

import { mockStudent, paginatedList, ulid } from '../factories';

export const studentHandlers = [
  // GET /api/v1/student/list
  http.get('*/api/v1/student/list', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';
    const status = url.searchParams.get('status') || '';
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const allStudents = Array.from({ length: 50 }, (_, i) =>
      mockStudent({
        id: ulid(),
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.com`,
        status: i % 5 === 0 ? 'DISABLED' : 'ACTIVE',
      }),
    );

    let filtered = allStudents;
    if (name) {
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }

    const page = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, filtered.length) });
  }),

  // POST /api/v1/student/
  http.post('*/api/v1/student', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { name } = body as { name?: string };

    if (!name) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 422 },
      );
    }

    return HttpResponse.json({ data: mockStudent({ id: ulid(), name }) }, { status: 201 });
  }),

  // GET /api/v1/student/:id
  http.get('*/api/v1/student/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockStudent({ id, name: 'Detail Student' }) });
  }),

  // PUT /api/v1/student/:id
  http.put('*/api/v1/student/:id', async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockStudent({ id }) });
  }),

  // PATCH /api/v1/student/:id/avatar
  http.patch('*/api/v1/student/:id/avatar', async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({
      data: { id, avatarUrl: 'https://example.com/avatars/new-avatar.jpg' },
    });
  }),

  // DELETE /api/v1/student/:id
  http.delete('*/api/v1/student/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockStudent({ id, deletedAt: new Date() }) });
  }),
];
