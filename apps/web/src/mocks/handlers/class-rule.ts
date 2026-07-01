import { http, HttpResponse } from 'msw';

import { mockClassRule, mockStudent, paginatedList, ulid } from '../factories';

export const classRuleHandlers = [
  // GET /api/v1/class-rule/list
  http.get('*/api/v1/class-rule/list', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const allRules = Array.from({ length: 15 }, (_, i) =>
      mockClassRule({
        id: ulid(),
        name: `Rule ${i + 1}`,
        course: { id: ulid(), name: `Course ${i + 1}`, status: 'ACTIVE' },
      }),
    );

    const page = allRules.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, allRules.length) });
  }),

  // GET /api/v1/class-rule/:id
  http.get('*/api/v1/class-rule/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({
      data: mockClassRule({ id, course: { id: ulid(), name: 'Detail Course', status: 'ACTIVE' } }),
    });
  }),

  // POST /api/v1/class-rule/
  http.post('*/api/v1/class-rule', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { name } = body as { name?: string };

    if (!name) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Name is required' } },
        { status: 422 },
      );
    }

    return HttpResponse.json({ data: mockClassRule({ id: ulid(), name }) }, { status: 201 });
  }),

  // PUT /api/v1/class-rule/:id
  http.put('*/api/v1/class-rule/:id', async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockClassRule({ id }) });
  }),

  // DELETE /api/v1/class-rule/:id
  http.delete('*/api/v1/class-rule/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockClassRule({ id }) });
  }),

  // GET /api/v1/class-rule/:ruleId/students
  http.get('*/api/v1/class-rule/:ruleId/students', () => {
    const allStudents = Array.from({ length: 5 }, (_, i) =>
      mockStudent({ id: ulid(), name: `Rule Student ${i + 1}` }),
    );
    return HttpResponse.json({ data: paginatedList(allStudents) });
  }),

  // GET /api/v1/class-rule/:ruleId/available-students
  http.get('*/api/v1/class-rule/:ruleId/available-students', () => {
    const allStudents = Array.from({ length: 10 }, (_, i) =>
      mockStudent({ id: ulid(), name: `Available Student ${i + 1}` }),
    );
    return HttpResponse.json({ data: paginatedList(allStudents) });
  }),

  // POST /api/v1/class-rule/:ruleId/student
  http.post('*/api/v1/class-rule/:ruleId/student', () => {
    return HttpResponse.json(
      {
        data: {
          id: ulid(),
          createdAt: new Date(),
          updatedAt: new Date(),
          classRuleId: ulid(),
          studentId: ulid(),
          userId: ulid(),
        },
      },
      { status: 201 },
    );
  }),

  // DELETE /api/v1/class-rule/class-rule-student/:id
  http.delete('*/api/v1/class-rule/class-rule-student/:id', () => {
    return HttpResponse.json({
      data: {
        id: ulid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
        classRuleId: ulid(),
        studentId: ulid(),
        userId: ulid(),
      },
    });
  }),

  // POST /api/v1/class-rule/check-conflicts
  http.post('*/api/v1/class-rule/check-conflicts', () => {
    return HttpResponse.json({ data: { hasConflict: false, conflicts: [] } });
  }),

  // GET /api/v1/class-rule/:id/preview
  http.get('*/api/v1/class-rule/:id/preview', () => {
    return HttpResponse.json({ data: { hasConflict: false, conflicts: [] } });
  }),

  // POST /api/v1/class-rule/:id/apply-changes
  http.post('*/api/v1/class-rule/:id/apply-changes', async ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockClassRule({ id }) });
  }),
];
