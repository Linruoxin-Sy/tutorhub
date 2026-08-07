import type { Course } from '@tutorhub/database';

import { ulid } from '@/mocks/utils';

export function mockCourse(overrides?: Partial<Course>): Course {
  return {
    id: ulid(),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    name: 'Math 101',
    description: 'Basic mathematics course',
    userId: ulid(),
    status: 'ACTIVE',
    ...overrides,
  };
}
