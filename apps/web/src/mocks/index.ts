import { authHandlers } from '@/features/auth/mocks/handlers';
import { classRuleHandlers } from '@/features/class-rule/mocks/handlers';
import { classSessionHandlers } from '@/features/class-session/mocks/handlers';
import { courseHandlers } from '@/features/course/mocks/handlers';
import { dashboardHandlers } from '@/features/dashboard/mocks/handlers';
import { enrollmentHandlers } from '@/features/enrollment/mocks/handlers';
import { storageHandlers, studentHandlers } from '@/features/student/mocks/handlers';

export const handlers = [
  ...authHandlers,
  ...studentHandlers,
  ...courseHandlers,
  ...classRuleHandlers,
  ...classSessionHandlers,
  ...enrollmentHandlers,
  ...dashboardHandlers,
  ...storageHandlers,
];
