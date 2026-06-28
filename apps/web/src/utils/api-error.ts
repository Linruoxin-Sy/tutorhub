import axios from 'axios';

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

/** HTTP 状态码 → 用户友好提示 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数有误，请检查输入',
  403: '权限不足，无法执行此操作',
  404: '请求的资源不存在',
  409: '数据冲突，请刷新后重试',
  422: '请求参数校验失败',
  429: '请求太频繁，请稍后再试',
  500: '服务器内部错误，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂时不可用，请稍后重试',
};

/** 常见网络错误码 → 用户友好提示 */
export const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  ERR_NETWORK: '网络连接失败，请检查网络',
  ECONNABORTED: '请求超时，请重试',
  ERR_CANCELED: '请求已取消',
};

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
      const fallbackMessage = HTTP_STATUS_MESSAGES[error.response.status];
      return {
        code: `HTTP_${error.response.status}`,
        message: fallbackMessage ?? `请求失败 (${error.response.status})`,
        status: error.response.status,
        details: null,
        raw: error,
      };
    }

    // 请求未收到响应（网络错误/超时/取消）
    if (error.code && NETWORK_ERROR_MESSAGES[error.code]) {
      return {
        code: error.code,
        message: NETWORK_ERROR_MESSAGES[error.code]!,
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
      message: error.message || '发生未知错误',
      status: null,
      details: null,
      raw: error,
    };
  }

  // ── 彻底兜底 ──
  return {
    code: 'UNKNOWN_ERROR',
    message: '发生未知错误',
    status: null,
    details: null,
    raw: error,
  };
}
