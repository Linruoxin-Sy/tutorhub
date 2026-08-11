import type { Currency } from '../currency';

export type DashboardStats = {
  activeStudents: number;
  activeCourses: number;
  totalHours: number;
  totalIncome: number;
  /** 总收入货币 */
  currency: Currency;
};
