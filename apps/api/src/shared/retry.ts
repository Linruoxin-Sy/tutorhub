export interface RetryOptions {
  /** 最大重试次数（默认 5） */
  maxRetries?: number;
  /** 初始延迟毫秒数（默认 1000） */
  baseDelay?: number;
  /** 最大延迟毫秒数（默认 10000） */
  maxDelay?: number;
  /** 操作名称（用于日志） */
  label?: string;
}

/**
 * 带指数退避 + 随机 jitter 的通用重试工具。
 *
 * 退避公式：delay = min(baseDelay * 2^attempt, maxDelay) ± 20% jitter
 * 每次重试前打印警告日志，所有重试用尽后抛出最后一次的错误。
 */
export async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const maxRetries = options?.maxRetries ?? 5;
  const baseDelay = options?.baseDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 10_000;
  const label = options?.label ?? 'operation';

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
        const jitter = delay * 0.2 * (Math.random() * 2 - 1); // ±20%
        const actualDelay = Math.round(delay + jitter);
        const message = error instanceof Error ? error.message : String(error);

        console.warn(
          `[retry] ${label} failed (${attempt + 1}/${maxRetries}): ${message}. Retrying in ${Math.round(actualDelay / 1000)}s...`,
        );

        await new Promise((resolve) => setTimeout(resolve, actualDelay));
      }
    }
  }

  throw lastError;
}
