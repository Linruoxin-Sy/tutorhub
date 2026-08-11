import { ulid } from '@/mocks/utils';

export function mockClassSessionOverride(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: ulid(),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    classRuleId: ulid(),
    userId: ulid(),
    originalDate: new Date('2025-03-01'),
    state: 'RESCHEDULED' as const,
    rescheduledDate: new Date('2025-03-03'),
    rescheduledStartTime: new Date('2025-03-03T10:00:00'),
    rescheduledEndTime: new Date('2025-03-03T11:30:00'),
    priceOverride: null,
    currencyOverride: null,
    reason: null,
    ...overrides,
  };
}
