import { createI18n } from 'vue-i18n';

import en from './en';
import zhCN from './zh-CN';

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

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
  },
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
