import { http, HttpResponse } from 'msw';

import {
  mockCourse,
  mockEnrollment,
  mockEnrollmentDetail,
  mockStudent,
  paginatedList,
  ulid,
} from '../factories';

export const enrollmentHandlers = [
  // GET /api/v1/enrollment/:id
  http.get('*/api/v1/enrollment/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockEnrollmentDetail({ id }) });
  }),

  // DELETE /api/v1/enrollment/:id
  http.delete('*/api/v1/enrollment/:id', ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({ data: mockEnrollment({ id, deletedAt: new Date() }) });
  }),

  // GET /api/v1/student/:studentId/enrollment/list
  http.get('*/api/v1/student/:studentId/enrollment/list', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const enrollments = Array.from({ length: 5 }, (_, i) => ({
      ...mockEnrollment({ id: ulid() }),
      course: mockCourse({ id: ulid(), name: `Enrolled Course ${i + 1}` }),
    }));

    const page = enrollments.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, enrollments.length) });
  }),

  // GET /api/v1/course/:courseId/enrollment/list
  http.get('*/api/v1/course/:courseId/enrollment/list', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const enrollments = Array.from({ length: 5 }, (_, i) => ({
      ...mockEnrollment({ id: ulid() }),
      student: mockStudent({ id: ulid(), name: `Enrolled Student ${i + 1}` }),
    }));

    const page = enrollments.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, enrollments.length) });
  }),

  // GET /api/v1/student/:studentId/available-courses
  http.get('*/api/v1/student/:studentId/available-courses', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const courses = Array.from({ length: 10 }, (_, i) =>
      mockCourse({ id: ulid(), name: `Available Course ${i + 1}` }),
    );

    const page = courses.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, courses.length) });
  }),

  // GET /api/v1/course/:courseId/available-students
  http.get('*/api/v1/course/:courseId/available-students', ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset')) || 0;
    const limit = Number(url.searchParams.get('limit')) || 20;

    const students = Array.from({ length: 10 }, (_, i) =>
      mockStudent({ id: ulid(), name: `Available Student ${i + 1}` }),
    );

    const page = students.slice(offset, offset + limit);
    return HttpResponse.json({ data: paginatedList(page, students.length) });
  }),

  // POST /api/v1/enrollment
  http.post('*/api/v1/enrollment', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const { studentId, courseId } = body as { studentId?: string; courseId?: string };

    if (!studentId || !courseId) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'studentId and courseId are required' } },
        { status: 422 },
      );
    }

    return HttpResponse.json(
      { data: mockEnrollment({ id: ulid(), studentId, courseId }) },
      { status: 201 },
    );
  }),
];
