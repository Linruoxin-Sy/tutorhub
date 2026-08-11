import Decimal from 'decimal.js';

import { CURRENCIES, type Currency } from '@tutorhub/schema';

import { i18n } from '@/locales';

export type { Currency };
export { CURRENCIES };

const CURRENCY_SYMBOLS: Record<Currency, string> = { CNY: '¥', USD: '$' };

/**
 * 根据用户环境推导默认货币偏好（Intl 时区 / UTC 偏移 / 语言）。
 * 仅作为表单下拉框的默认选项，绝不强制任何价格。
 */
export function detectPreferredCurrency(): Currency {
  if (typeof window === 'undefined') return 'CNY';

  // 1. 时区为北京时间
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone === 'Asia/Shanghai') return 'CNY';

  // 2. UTC+8 偏移（getTimezoneOffset 返回「本地时间 - UTC」，中国为 -480）
  const offset = new Date().getTimezoneOffset();
  if (offset === -480) return 'CNY';

  // 3. 浏览器语言为中文
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  if (langs.some((l) => l.toLowerCase().startsWith('zh'))) return 'CNY';

  // 4. 兜底
  return 'USD';
}

/** 货币符号 */
export function currencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

/** 金额格式化（基于当前 i18n locale 的 Intl 数字格式化，按 currency code 动态显示，天然支持未来货币） */
export function formatMoney(amount: number | string | Decimal, currency: Currency): string {
  const value = typeof amount === 'number' ? amount : Number(amount);
  const locale = i18n.global.locale.value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * 货币换算（以 base 货币为中间桥梁：from → base → to，支持任意货币而非两两硬编码）。
 * 使用 decimal.js 精确计算，避免浮点误差。
 */
export function convert(
  amount: Decimal.Value,
  from: Currency,
  to: Currency,
  rates: Partial<Record<Currency, number>>,
): Decimal {
  const value = new Decimal(amount);
  if (from === to) return value;

  const fromRate = new Decimal(rates[from] ?? 0);
  const toRate = new Decimal(rates[to] ?? 0);
  if (fromRate.isZero() || toRate.isZero()) return value;

  return value.div(fromRate).mul(toRate);
}
