import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';

import { CURRENCIES, type Currency, type CurrencyRatesResponse } from '@tutorhub/schema';

import { useUserStore } from '@/features/auth/stores/user';
import { convert as convertAmount, detectPreferredCurrency } from '@/utils/currency';
import { request } from '@/utils/request';

const CURRENCY_RATES_KEY = 'currencyRatesCache';
const CURRENCY_RATES_TTL = 6 * 60 * 60 * 1000; // 6 小时

type CachedRates = CurrencyRatesResponse & { cachedAt: string };

function readRatesCache(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CURRENCY_RATES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (Date.now() - new Date(parsed.cachedAt).getTime() > CURRENCY_RATES_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRatesCache(res: CurrencyRatesResponse): void {
  try {
    const cached: CachedRates = { ...res, cachedAt: new Date().toISOString() };
    localStorage.setItem(CURRENCY_RATES_KEY, JSON.stringify(cached));
  } catch {
    // 忽略写入失败（如隐私模式）
  }
}

/**
 * 货币偏好：来自用户表（userStore.user.currency），未登录/无值时用环境推导兜底。
 * 仅作为表单下拉框的默认选项，不强制任何价格。
 */
export function usePreferredCurrency() {
  const userStore = useUserStore();

  const preferredCurrency = computed<Currency>(() => {
    const c = userStore.user.currency;
    if (c && CURRENCIES.includes(c)) return c;
    return detectPreferredCurrency();
  });

  /** 更新用户货币偏好（PATCH /auth/me，仅改变默认选项） */
  const setPreferredCurrency = async (currency: Currency) => {
    await userStore.updateCurrency(currency);
  };

  return { preferredCurrency, setPreferredCurrency };
}

/**
 * 汇率 hook：后端接口 + localStorage 缓存（6h TTL）。
 * 供表单输入时的另一货币等价预览换算使用。
 */
export function useCurrencyRates() {
  const query = useQuery<CurrencyRatesResponse>({
    queryKey: ['currency-rates'],
    queryFn: async () => {
      const { data } = await request.get<CurrencyRatesResponse>('/currency/rates');
      writeRatesCache(data);
      return data;
    },
    initialData: readRatesCache() ?? undefined,
    staleTime: CURRENCY_RATES_TTL,
  });

  const rates = computed(() => query.data.value?.rates ?? {});
  const currencyOptions: readonly Currency[] = CURRENCIES;

  /** 换算并四舍五入到分 */
  const convert = (amount: number, from: Currency, to: Currency): number => {
    if (!rates.value[from] || !rates.value[to]) return amount;
    return convertAmount(amount, from, to, rates.value).toDecimalPlaces(2).toNumber();
  };

  return { rates, currencyOptions, convert, isLoading: query.isLoading };
}
