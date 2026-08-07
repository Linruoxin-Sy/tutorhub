import type { ClassRuleListItem } from '@tutorhub/schema';

import { ulid } from '@/mocks/utils';

export function mockClassRule(overrides?: Partial<ClassRuleListItem>): ClassRuleListItem {
  return {
    id: ulid(),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    courseId: ulid(),
    userId: ulid(),
    name: 'Weekly Math',
    startDate: new Date('2025-01-06'),
    intervalDays: 7,
    endDate: new Date('2025-06-30'),
    startTime: new Date('2025-01-06T09:00:00'),
    endTime: new Date('2025-01-06T10:30:00'),
    price: 200 as unknown as ClassRuleListItem['price'],
    course: { id: ulid(), name: 'Math 101', status: 'ACTIVE' },
    ...overrides,
  };
}
