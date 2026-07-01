import { http, HttpResponse } from 'msw';

import { mockClassSessionOverride, paginatedList, ulid } from '../factories';

export const classSessionHandlers = [
  // GET /api/v1/class-session/list
  http.get('*/api/v1/class-session/list', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const allOverrides = Array.from({ length: 8 }, (_, i) =>
      mockClassSessionOverride({
        id: ulid(),
        originalDate: new Date(`2025-03-${String(i + 1).padStart(2, '0')}`),
      }),
    );

    const page = allOverrides.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, allOverrides.length) });
  }),

  // GET /api/v1/class-session/:id
  http.get('*/api/v1/class-session/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({
      data: {
        ...mockClassSessionOverride({ id }),
        classRule: {
          startTime: new Date('2025-01-06T09:00:00'),
          endTime: new Date('2025-01-06T10:30:00'),
        },
      },
    });
  }),

  // POST /api/v1/class-session/
  http.post('*/api/v1/class-session', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { classRuleId } = body as { classRuleId?: string };
    return HttpResponse.json(
      { data: mockClassSessionOverride({ id: ulid(), classRuleId: classRuleId ?? ulid() }) },
      { status: 201 },
    );
  }),

  // PUT /api/v1/class-session/:id
  http.put('*/api/v1/class-session/:id', async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockClassSessionOverride({ id }) });
  }),

  // DELETE /api/v1/class-session/:id
  http.delete('*/api/v1/class-session/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockClassSessionOverride({ id, deletedAt: new Date() }) });
  }),

  // POST /api/v1/class-session/check-conflicts
  http.post('*/api/v1/class-session/check-conflicts', () => {
    return HttpResponse.json({ data: { hasConflict: false, conflicts: [] } });
  }),
];
