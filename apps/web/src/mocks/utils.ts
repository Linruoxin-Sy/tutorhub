/** 生成 ULID 风格的 ID */
export function ulid(): string {
  const ts = Date.now().toString(36).padStart(10, '0');
  const rand = Math.random().toString(36).substring(2, 10).padEnd(8, '0');
  return `01${ts}${rand}`;
}

/** 常用日期格式化 */
export function toISO(date: Date): string {
  return date.toISOString();
}

/** 分页列表包装 */
export function paginatedList<T>(items: T[], total?: number) {
  return {
    items,
    nextCursor: null,
    total: total ?? items.length,
  };
}
