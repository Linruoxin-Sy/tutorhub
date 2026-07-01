import { http, HttpResponse } from 'msw';

import { mockCourse, paginatedList, ulid } from '../factories';

export const courseHandlers = [
  // GET /api/v1/course/list
  http.get('*/api/v1/course/list', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || '';
    const status = url.searchParams.get('status') || '';
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const allCourses = Array.from({ length: 30 }, (_, i) =>
      mockCourse({
        id: ulid(),
        name: `Course ${i + 1}`,
        description: `Description for course ${i + 1}`,
        status: i % 4 === 0 ? 'DISABLED' : 'ACTIVE',
      }),
    );

    let filtered = allCourses;
    if (name) {
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }

    const page = filtered.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, filtered.length) });
  }),

  // POST /api/v1/course/
  http.post('*/api/v1/course', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { name } = body as { name?: string };

    if (!name) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 422 },
      );
    }

    return HttpResponse.json({ data: mockCourse({ id: ulid(), name }) }, { status: 201 });
  }),

  // GET /api/v1/course/:id
  http.get('*/api/v1/course/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockCourse({ id, name: 'Detail Course' }) });
  }),

  // PUT /api/v1/course/:id
  http.put('*/api/v1/course/:id', async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockCourse({ id }) });
  }),

  // DELETE /api/v1/course/:id
  http.delete('*/api/v1/course/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockCourse({ id, deletedAt: new Date() }) });
  }),
];
