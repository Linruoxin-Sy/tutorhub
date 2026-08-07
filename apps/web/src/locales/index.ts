import { createI18n } from 'vue-i18n';

import authEn from '@/features/auth/locales/en';
import authZh from '@/features/auth/locales/zh-CN';
import classRuleEn from '@/features/class-rule/locales/en';
import classRuleZh from '@/features/class-rule/locales/zh-CN';
import courseEn from '@/features/course/locales/en';
import courseZh from '@/features/course/locales/zh-CN';
import dashboardEn from '@/features/dashboard/locales/en';
import dashboardZh from '@/features/dashboard/locales/zh-CN';
import enrollmentEn from '@/features/enrollment/locales/en';
import enrollmentZh from '@/features/enrollment/locales/zh-CN';
import sessionEn from '@/features/session/locales/en';
import sessionZh from '@/features/session/locales/zh-CN';
import studentEn from '@/features/student/locales/en';
import studentZh from '@/features/student/locales/zh-CN';

import sharedEn from './shared/en';
import sharedZh from './shared/zh-CN';

export type AppLocale = 'en' | 'zh-CN';

export const LOCALE_STORAGE_KEY = 'locale';

export const SUPPORTED_LOCALES: AppLocale[] = ['en', 'zh-CN'];

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value);
}

/** vue-i18n 消息 key 联合类型（用于 T 组件等强类型场景） */
export type MessageKey = Parameters<(typeof i18n.global)['t']>[0];

/** 从 localStorage 读取初始语言（默认 en） */
export function getInitialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isAppLocale(stored) ? stored : 'en';
}

/** 组装 en / zh-CN 消息树（命名空间 key 在此统一装配） */
const en = {
  ...sharedEn,
  auth: authEn,
  student: studentEn,
  course: courseEn,
  classRule: classRuleEn,
  session: sessionEn,
  enrollment: enrollmentEn,
  dashboard: dashboardEn,
};

const zhCN = {
  ...sharedZh,
  auth: authZh,
  student: studentZh,
  course: courseZh,
  classRule: classRuleZh,
  session: sessionZh,
  enrollment: enrollmentZh,
  dashboard: dashboardZh,
};

export const messages = { en, 'zh-CN': zhCN };

/** 完整消息结构（供 vue-i18n 类型增强引用） */
export type MessageSchema = typeof en;

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages,
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    },
    'zh-CN': {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    },
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
  },
  missingWarn: false,
  fallbackWarn: false,
});
