import axios from 'axios';
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

// ── 刷新状态（用于并发 401 时排队重试） ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
  for (const { resolve, reject } of failedQueue) {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  }
  failedQueue = [];
}

/** 清除所有登录态并跳转到登录页 */
function forceLogout(message: string): void {
  localStorage.removeItem(TOKEN_KEY);
  toast.error(message);
  router.push({ name: 'auth.login' });
}

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果请求配置不存在（非 Axios 错误），走通用错误处理
    if (!originalRequest) {
      return handleGenericError(error);
    }

    const normalized = extractApiError(error);

    // ── 401: 尝试刷新 Token ──
    if (normalized.status === 401 && !originalRequest._retry) {
      // 刷新接口本身返回 401 → 直接登出，避免死循环
      if (originalRequest.url === '/auth/refresh') {
        forceLogout('Session expired. Please log in again.');
        return Promise.reject(error);
      }

      // 已有刷新请求进行中 → 排队等待
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return request(originalRequest);
        });
      }

      // 开始刷新
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 发送刷新请求（实例已配置 withCredentials，自动携带 Cookie）
        const { data } = await request.post<RefreshResponse>('/auth/refresh');

        const newToken = data.accessToken;
        localStorage.setItem(TOKEN_KEY, newToken);

        // 重放排队中的请求
        processQueue(null, newToken);

        // 重试当前请求
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return handleGenericError(error);
  },
);

/** 处理非 401 或无需刷新的错误 */
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
