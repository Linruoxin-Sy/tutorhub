export const DEFAULT_FORM_DATA = {
  name: '',
  status: 'ACTIVE' as const,
  description: '',
};

export const FORM_DATA_KEYS = Object.keys(DEFAULT_FORM_DATA) as (keyof typeof DEFAULT_FORM_DATA)[];

export type CourseFormData = typeof DEFAULT_FORM_DATA;
