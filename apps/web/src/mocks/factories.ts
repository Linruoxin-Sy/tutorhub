import type { Course, StudentCourse } from '@tutorhub/database';
import type {
  ClassRuleListItem,
  DashboardResponse,
  EnrollmentDetailResponse,
  GeneratedSession,
  LoginResponse,
  RegisterResponse,
} from '@tutorhub/schema';

/** 生成 ULID 风格的 ID */
export function ulid(): string {
  const ts = Date.now().toString(36).padStart(10, '0');
  const rand = Math.random().toString(36).substring(2, 10).padEnd(8, '0');
  return `01${ts}${rand}`;
}

/** 常用日期格式化 */
export function toISO(date: Date): string {
  return date.toISOString();
}

export function mockUser(overrides?: Partial<LoginResponse['user']>): LoginResponse['user'] {
  return {
    id: ulid(),
    name: 'Test User',
    email: 'test@example.com',
    phone: null,
    avatarUrl: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

export function mockLoginResponse(overrides?: Partial<LoginResponse>): LoginResponse {
  return {
    user: mockUser(),
    token: 'mock-jwt-token-abc123',
    ...overrides,
  };
}

export function mockRegisterResponse(overrides?: Partial<RegisterResponse>): RegisterResponse {
  return {
    ...mockUser(),
    ...overrides,
  };
}

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
    reason: null,
    ...overrides,
  };
}

export function mockEnrollment(overrides?: Partial<StudentCourse>): StudentCourse {
  return {
    id: ulid(),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    studentId: ulid(),
    courseId: ulid(),
    userId: ulid(),
    ...overrides,
  };
}

export function mockEnrollmentDetail(
  overrides?: Partial<EnrollmentDetailResponse>,
): EnrollmentDetailResponse {
  const student = mockStudent();
  const course = mockCourse();
  return {
    ...mockEnrollment(),
    student: {
      id: student.id,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      deletedAt: student.deletedAt,
      userId: student.userId,
      name: student.name,
      avatarKey: null,
      email: student.email,
      phone: student.phone,
      description: student.description,
      status: student.status,
    },
    course,
    ...overrides,
  };
}

export function mockGeneratedSession(overrides?: Partial<GeneratedSession>): GeneratedSession {
  return {
    id: ulid(),
    occurrenceDate: '2025-03-01',
    startTime: '09:00',
    endTime: '10:30',
    status: 'default',
    overridden: false,
    rescheduledDate: null,
    rescheduledStartTime: null,
    rescheduledEndTime: null,
    overriddenDate: null,
    price: 200,
    originalPrice: 200,
    ...overrides,
  };
}

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

/** 分页列表包装 */
export function paginatedList<T>(items: T[], total?: number) {
  return {
    items,
    nextCursor: null,
    total: total ?? items.length,
  };
}
