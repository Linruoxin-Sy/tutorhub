import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';

import { i18n, LOCALE_STORAGE_KEY, type AppLocale } from './index';

const isClient =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof localStorage !== 'undefined';

/**
 * 应用语言切换副作用：
 * - 同步 vue-i18n 全局 locale
 * - 写入 localStorage（持久化）
 * - 更新 <html lang>
 * - 切换 dayjs locale（日期格式化随语言）
 * - 更新 document.title
 */
export function applyLocale(locale?: AppLocale) {
  const next = locale ?? (i18n.global.locale.value as AppLocale);

  i18n.global.locale.value = next;

  if (!isClient) return;

  localStorage.setItem(LOCALE_STORAGE_KEY, next);
  document.documentElement.lang = next === 'zh-CN' ? 'zh-CN' : 'en';
  dayjs.locale(next === 'zh-CN' ? 'zh-cn' : 'en');
  document.title = i18n.global.t('common.app.title');
}
