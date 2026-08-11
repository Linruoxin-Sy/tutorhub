import Decimal from 'decimal.js';

import type { Currency, CurrencyRatesResponse } from '@tutorhub/schema';

/** 支持的货币（与 DB 枚举 / schema 同步，未来新增货币只需扩展此数组与 DEFAULT_RATES） */
const SUPPORTED_CURRENCIES: Currency[] = ['CNY', 'USD'];

/** 默认汇率（以 USD 为基准，即 1 USD = X 各货币）。外部 API 刷新失败时回退此值 */
const DEFAULT_RATES: Record<Currency, number> = { CNY: 7.2, USD: 1 };

/** 汇率刷新地址（免费、无需 key，返回以 USD 为基准的 rates） */
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

/** 汇率刷新周期（6 小时） */
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** 当前汇率表（进程内存缓存，不落库） */
let rates: Record<Currency, number> = { ...DEFAULT_RATES };
/** 汇率更新时间 */
let updatedAt = new Date(0).toISOString();
/** 进行中的刷新任务（防并发重复刷新） */
let refreshing: Promise<void> | null = null;

/** 从外部 API 拉取汇率（失败抛错，由调用方回退） */
async function fetchRatesFromApi(): Promise<{
  rates: Record<Currency, number>;
  updatedAt: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(EXCHANGE_RATE_API, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`exchange rate api responded ${res.status}`);
    }
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== 'success' || !data.rates) {
      throw new Error('exchange rate api returned failure');
    }

    const next: Record<Currency, number> = { ...DEFAULT_RATES };
    for (const code of SUPPORTED_CURRENCIES) {
      const rate = data.rates[code];
      if (typeof rate === 'number' && rate > 0) next[code] = rate;
    }

    return {
      rates: next,
      updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** 刷新汇率（失败回退默认值，绝不抛出；可并发安全） */
export async function refreshRates(): Promise<void> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const next = await fetchRatesFromApi();
      rates = next.rates;
      updatedAt = next.updatedAt;
    } catch (err) {
      // 保持旧值，仅标记更新失败（从未成功则一直用默认汇率）
      updatedAt = new Date().toISOString();
      console.warn('[currency] failed to refresh exchange rates, falling back to defaults', err);
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** 启动汇率定时刷新（进程内调用一次即可） */
export function startCurrencyRefresh(): void {
  void refreshRates();
  setInterval(() => void refreshRates(), REFRESH_INTERVAL_MS).unref?.();
}

/** 获取当前汇率快照 */
export function getRates(): Record<Currency, number> {
  return { ...rates };
}

/** 转换为 API 响应结构 */
export function toCurrencyRatesResponse(): CurrencyRatesResponse {
  return { base: 'USD', rates: getRates(), updatedAt };
}

/**
 * 货币换算（以 base 货币为中间桥梁：from → base → to，天然支持任意货币而非两两硬编码）。
 * 所有运算使用 decimal.js，避免浮点误差。
 */
export function convert(
  amount: Decimal.Value,
  from: Currency,
  to: Currency,
  ratesOverride?: Record<Currency, number>,
): Decimal {
  const value = new Decimal(amount);
  if (from === to) return value;

  const table = ratesOverride ?? rates;
  const fromRate = new Decimal(table[from]);
  const toRate = new Decimal(table[to]);
  if (fromRate.isZero() || toRate.isZero()) {
    throw new Error(`[currency] missing exchange rate for ${from}/${to}`);
  }

  return value.div(fromRate).mul(toRate);
}

/** 换算并四舍五入到分（2 位小数） */
export function convertRounded(
  amount: Decimal.Value,
  from: Currency,
  to: Currency,
  ratesOverride?: Record<Currency, number>,
): number {
  return convert(amount, from, to, ratesOverride).toDecimalPlaces(2).toNumber();
}
