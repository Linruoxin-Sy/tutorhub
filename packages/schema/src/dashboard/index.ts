import type { DashboardStats } from './stats';
import type { DashboardRecentSession } from './recent-sessions';

export type { DashboardStats, DashboardRecentSession };

export type DashboardResponse = DashboardStats & {
  recentSessions: DashboardRecentSession[];
};
