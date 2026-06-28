import axios from 'axios';
import { toast } from 'vue-sonner';

import router from '@/router';

import { extractApiError, HTTP_STATUS_MESSAGES } from './api-error';
import { getEnv } from './env';

export const request = axios.create({
  baseURL: getEnv('BASE_URL'),
  timeout: 5000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = extractApiError(error);

    // ── 401: 未授权 → 登出重定向 ──
    if (normalized.status === 401) {
      localStorage.removeItem('token');
      toast.error('Unauthorized. Please log in again.');
      router.push({ name: 'auth.login' });
      return Promise.reject(error);
    }

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
  },
);
