import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Currency } from '@tutorhub/schema';

import { convert, detectPreferredCurrency, formatMoney } from '@/utils/currency';

describe('currency utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('detectPreferredCurrency', () => {
    /** mock Intl.DateTimeFormat 的时区解析结果 */
    function mockTimeZone(timeZone: string) {
      vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
        locale: 'en-US',
        timeZone,
      } as Intl.ResolvedDateTimeFormatOptions);
    }

    it('returns CNY when timezone is Asia/Shanghai', () => {
      mockTimeZone('Asia/Shanghai');
      expect(detectPreferredCurrency()).toBe('CNY');
    });

    it('returns CNY when UTC offset is +8 (getTimezoneOffset = -480)', () => {
      mockTimeZone('America/New_York');
      vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-480);
      expect(detectPreferredCurrency()).toBe('CNY');
    });

    it('returns CNY when browser language is Chinese', () => {
      mockTimeZone('Europe/Berlin');
      vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-60);
      Object.defineProperty(navigator, 'languages', {
        value: ['zh-CN', 'en-US'],
        configurable: true,
      });
      expect(detectPreferredCurrency()).toBe('CNY');
    });

    it('falls back to USD for western environments', () => {
      mockTimeZone('America/New_York');
      vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(300);
      Object.defineProperty(navigator, 'languages', {
        value: ['en-US'],
        configurable: true,
      });
      expect(detectPreferredCurrency()).toBe('USD');
    });
  });

  describe('convert', () => {
    const rates = { CNY: 7.2, USD: 1 } as Record<Currency, number>;

    it('converts CNY to USD through the base currency', () => {
      expect(convert(200, 'CNY', 'USD', rates).toNumber()).toBeCloseTo(27.7778, 3);
    });

    it('converts USD to CNY through the base currency', () => {
      expect(convert(25.5, 'USD', 'CNY', rates).toNumber()).toBeCloseTo(183.6, 3);
    });

    it('returns the same value for identical currencies', () => {
      expect(convert(100, 'CNY', 'CNY', rates).toString()).toBe('100');
    });
  });

  describe('formatMoney', () => {
    it('formats an amount with the USD symbol', () => {
      const usd = formatMoney(25.5, 'USD');
      expect(usd).toContain('25.50');
      expect(usd).toContain('$');
    });

    it('formats an amount with the CNY symbol', () => {
      const cny = formatMoney(300, 'CNY');
      expect(cny).toContain('300');
      expect(cny).toContain('¥');
    });
  });
});
