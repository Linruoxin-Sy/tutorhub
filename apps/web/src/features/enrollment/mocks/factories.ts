import type { StudentCourse } from '@tutorhub/database';
import type { EnrollmentDetailResponse } from '@tutorhub/schema';

import { mockCourse } from '@/features/course/mocks/factories';
import { mockStudent } from '@/features/student/mocks/factories';
import { ulid } from '@/mocks/utils';

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
