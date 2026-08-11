import { z } from 'zod';

/** 支持的货币列表（未来新增货币只需扩展此数组 + 后端汇率数据 + DB 枚举） */
export const CURRENCIES = ['CNY', 'USD'] as const;

/** 货币类型 */
export type Currency = (typeof CURRENCIES)[number];

/** 货币校验 schema */
export const currencySchema = z.enum(CURRENCIES);

/** 汇率响应（以 base 货币为基准，1 单位 base 兑各货币的汇率） */
export type CurrencyRatesResponse = {
  /** 基准货币 */
  base: Currency;
  /** 各货币兑 base 的汇率（base 自身恒为 1） */
  rates: Partial<Record<Currency, number>>;
  /** 汇率更新时间（ISO 字符串） */
  updatedAt: string;
};
