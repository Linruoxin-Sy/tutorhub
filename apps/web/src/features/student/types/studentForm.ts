export const DEFAULT_FORM_DATA = {
  name: '',
  email: '',
  phone: '',
  description: '',
};

export const FORM_DATA_KEYS = Object.keys(DEFAULT_FORM_DATA) as (keyof typeof DEFAULT_FORM_DATA)[];

export type StudentForm = typeof DEFAULT_FORM_DATA;
