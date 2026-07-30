import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { toast } from 'vue-sonner';

import type { RefreshResponse } from '@tutorhub/schema';

import router from '@/router';

import { extractApiError, HTTP_STATUS_MESSAGES } from './api-error';
import { getEnv } from './env';

const TOKEN_KEY = 'accessToken';

export const request = axios.create({
  baseURL: getEnv('BASE_URL'),
  timeout: 5000,
  withCredentials: true,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 401 自动刷新（axios-auth-refresh 接管队列和重试） ──
createAuthRefreshInterceptor(
  request,
  async (error) => {
    const { data } = await axios.post<RefreshResponse>(
      `${getEnv('BASE_URL')}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    const newToken = data.accessToken;
    localStorage.setItem(TOKEN_KEY, newToken);

    // 为重试请求设置新 token
    if (error.response?.config.headers) {
      error.response.config.headers.Authorization = `Bearer ${newToken}`;
    }
  },
  {
    statusCodes: [401],
    maxRetries: 1,
    onRetry: (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
  },
);

// ── 捕获刷新失败的 401（刷新接口返回 401 或网络错误） ──
request.interceptors.response.use(
  (response) => response,
  (error) => {
    // axios-auth-refresh 已处理成功刷新的 401，此处仅处理刷新失败后的残留 401
    const normalized = extractApiError(error);

    if (normalized.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      toast.error('Session expired. Please log in again.');
      router.push({ name: 'auth.login' });
      return Promise.reject(error);
    }

    return handleGenericError(error);
  },
);

/** 处理非 401 的通用错误 */
function handleGenericError(error: unknown): Promise<never> {
  const normalized = extractApiError(error);

  // ── 400/422: 校验错误 → 如果后端有 details（Zod issues）遍历显示 ──
  if (normalized.status === 400 || normalized.status === 422) {
    if (normalized.code === 'VALIDATION_ERROR' && Array.isArray(normalized.details)) {
      for (const issue of normalized.details as { message?: string }[]) {
        toast.warning(issue.message ?? normalized.message);
      }
    } else {
      toast.warning(normalized.message);
    }
    return Promise.reject(error);
  }

  // ── 其它 HTTP 状态码 → 从预设映射中取消息 ──
  if (normalized.status && HTTP_STATUS_MESSAGES[normalized.status]) {
    toast.error(HTTP_STATUS_MESSAGES[normalized.status]!);
    return Promise.reject(error);
  }

  // ── 网络错误 / 超时 / 取消 ──
  if (normalized.status === null && normalized.code !== 'UNKNOWN_ERROR') {
    toast.error(normalized.message);
    return Promise.reject(error);
  }

  // ── 兜底 ──
  toast.error(normalized.message);
  return Promise.reject(error);
}
