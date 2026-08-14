import type { MessageKey } from '@/locales';

export interface NavItem {
  labelKey: MessageKey;
  routeName: string;
  icon: string;
}

/** 顶部导航与移动端抽屉共用的导航项配置 */
export const navItems = [
  {
    labelKey: 'layouts.nav.dashboard',
    routeName: 'dashboard',
    icon: 'i-mdi-view-dashboard-outline',
  },
  {
    labelKey: 'layouts.nav.student',
    routeName: 'student.list',
    icon: 'i-lucide-users',
  },
  {
    labelKey: 'layouts.nav.course',
    routeName: 'course.list',
    icon: 'i-lucide-book-open',
  },
  {
    labelKey: 'layouts.nav.classRule',
    routeName: 'class-rule.list',
    icon: 'i-lucide-calendar-check',
  },
] as const satisfies readonly NavItem[];

/**
 * 判断导航项是否匹配当前路由。
 * 支持子路由前缀匹配：`student.list` 会命中 `student.detail` 等 `student.` 前缀路由。
 */
export function isNavActive(routeName: string, currentRouteName: unknown): boolean {
  const current = String(currentRouteName ?? '');
  const prefix = routeName.includes('.') ? routeName.split('.')[0] + '.' : routeName;
  return current === routeName || current.startsWith(prefix);
}
