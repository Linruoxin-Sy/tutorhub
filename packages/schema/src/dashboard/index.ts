import type { DashboardRecentSession } from './recent-sessions';
import type { DashboardStats } from './stats';

export type { DashboardStats, DashboardRecentSession };

export type DashboardResponse = DashboardStats & {
  recentSessions: DashboardRecentSession[];
};
