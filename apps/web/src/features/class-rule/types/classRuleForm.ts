import type { Currency } from '@tutorhub/schema';

export const DEFAULT_FORM_DATA = {
  name: '',
  price: null as number | null,
  currency: 'CNY' as Currency,
  startDate: '',
  startTime: '',
  endTime: '',
  intervalDays: null as number | null,
  endDate: '',
  isRecurring: false,
};

export const FORM_DATA_KEYS = Object.keys(DEFAULT_FORM_DATA) as (keyof typeof DEFAULT_FORM_DATA)[];

export type ClassRuleFormData = typeof DEFAULT_FORM_DATA;
