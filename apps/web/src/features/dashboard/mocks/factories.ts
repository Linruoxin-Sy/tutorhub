import type { DashboardResponse } from '@tutorhub/schema';

import { ulid } from '@/mocks/utils';

export function mockDashboard(overrides?: Partial<DashboardResponse>): DashboardResponse {
  return {
    activeStudents: 42,
    activeCourses: 8,
    totalHours: 156,
    totalIncome: 31200,
    recentSessions: [
      {
        id: `${ulid()}_2025-03-01`,
        courseName: 'Math 101',
        courseId: ulid(),
        ruleId: ulid(),
        studentNames: ['Alice', 'Bob'],
        date: '2025-03-01',
        startTime: '09:00',
        endTime: '10:30',
        status: 'default',
      },
    ],
    ...overrides,
  };
}
