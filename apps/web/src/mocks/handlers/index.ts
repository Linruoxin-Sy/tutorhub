import { authHandlers } from './auth';
import { classRuleHandlers } from './class-rule';
import { classSessionHandlers } from './class-session';
import { courseHandlers } from './course';
import { dashboardHandlers } from './dashboard';
import { enrollmentHandlers } from './enrollment';
import { storageHandlers } from './storage';
import { studentHandlers } from './student';

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
