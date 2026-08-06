import axios from 'axios';

import { i18n, type MessageKey } from '@/locales';

/** 后端错误响应的标准格式 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details: unknown;
}

/** 前端标准化后的错误信息 */
export interface NormalizedApiError {
  code: string;
  message: string;
  status: number | null;
  details: unknown;
  /** 原始错误对象（用于调试） */
  raw: unknown;
}

/** 有本地化文案的 HTTP 状态码 */
const KNOWN_HTTP_STATUSES = new Set([400, 403, 404, 409, 422, 429, 500, 502, 503]);

/** 常见网络错误码（有本地化文案） */
const NETWORK_ERROR_CODES = ['ERR_NETWORK', 'ECONNABORTED', 'ERR_CANCELED'] as const;

/** HTTP 状态码 → 本地化用户提示（惰性解析，跟随当前语言） */
export function getHttpStatusMessage(status: number): string {
  if (KNOWN_HTTP_STATUSES.has(status)) {
    return i18n.global.t(`errors.http.${status}` as MessageKey);
  }
  return i18n.global.t('errors.requestFailed', { status });
}

/** 网络错误码 → 本地化用户提示（惰性解析，跟随当前语言） */
export function getNetworkErrorMessage(code: string): string {
  return i18n.global.t(`errors.network.${code}` as MessageKey);
}

/**
 * 从任何错误对象中标准化提取后端/前端错误信息。
 *
 * 处理优先级：
 * 1. Axios 错误 → 解包后端 `{ error: { code, message, details } }` 格式
 * 2. 网络错误（ERR_NETWORK/ECONNABORTED）→ 返回预设消息
 * 3. 非 Axios Error 实例 → 兜底
 */
export function extractApiError(error: unknown): NormalizedApiError {
  // ── Axios 错误 ──
  if (axios.isAxiosError(error)) {
    // 请求已发出且收到响应（4xx/5xx）
    if (error.response) {
      const body = error.response.data as Record<string, unknown>;
      const serverError = body?.error as ApiErrorResponse | undefined;

      if (serverError?.code && serverError?.message) {
        return {
          code: serverError.code,
          message: serverError.message,
          status: error.response.status,
          details: serverError.details ?? null,
          raw: error,
        };
      }

      // 后端返回了非标准格式 → 使用 HTTP 状态码映射
      return {
        code: `HTTP_${error.response.status}`,
        message: getHttpStatusMessage(error.response.status),
        status: error.response.status,
        details: null,
        raw: error,
      };
    }

    // 请求未收到响应（网络错误/超时/取消）
    if (error.code && (NETWORK_ERROR_CODES as readonly string[]).includes(error.code)) {
      return {
        code: error.code,
        message: getNetworkErrorMessage(error.code),
        status: null,
        details: null,
        raw: error,
      };
    }
  }

  // ── 普通 Error / 未知错误 ──
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || i18n.global.t('errors.unknown'),
      status: null,
      details: null,
      raw: error,
    };
  }

  // ── 彻底兜底 ──
  return {
    code: 'UNKNOWN_ERROR',
    message: i18n.global.t('errors.unknown'),
    status: null,
    details: null,
    raw: error,
  };
}
