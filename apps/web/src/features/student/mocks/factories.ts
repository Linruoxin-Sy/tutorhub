import { ulid } from '@/mocks/utils';

export function mockStudent(overrides?: Partial<ReturnType<typeof mockStudentRaw>>) {
  const base = mockStudentRaw(overrides);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { avatarKey, ...rest } = base;
  return {
    ...rest,
    avatarUrl: base.avatarUrl,
  };
}

function mockStudentRaw(
  overrides?: Partial<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    userId: string;
    name: string;
    avatarKey: string | null;
    avatarUrl: string | null;
    email: string | null;
    phone: string | null;
    description: string | null;
    status: 'ACTIVE' | 'DISABLED';
  }>,
) {
  return {
    id: ulid(),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    userId: ulid(),
    name: 'Alice Johnson',
    avatarKey: null,
    avatarUrl: null,
    email: 'alice@example.com',
    phone: '13800138000',
    description: null,
    status: 'ACTIVE' as const,
    ...overrides,
  };
}
