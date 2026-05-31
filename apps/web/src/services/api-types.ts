export interface PageResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AuditFields {
  id: string;
  createdAt: string;
  updatedAt: string;
}
