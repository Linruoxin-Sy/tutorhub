import { z } from 'zod';

import type { Currency, LoginResponse, loginSchema } from '@tutorhub/schema';

import { i18n } from '@/locales';
import { request } from '@/utils/request';

type UserState = LoginResponse['user'];

const TOKEN_KEY = 'accessToken';

const initialUserState: UserState = {
  id: '',
  name: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  email: null,
  phone: null,
  avatarUrl: '',
  currency: 'CNY',
};

export const useUserStore = defineStore('auth/user', () => {
  const user = ref<UserState>(initialUserState);

  const login = async (payload: z.infer<typeof loginSchema>) => {
    try {
      const { data } = await request.post<LoginResponse>('/auth/login', payload);
      user.value = data.user;
      localStorage.setItem(TOKEN_KEY, data.accessToken);
    } catch {
      // Axios 拦截器已显示错误 toast，此处仅阻止传播
      throw new Error(i18n.global.t('auth.errors.loginFailed'));
    }
  };

  /** 刷新 Access Token（由 request.ts 拦截器自动调用） */
  const setAccessToken = (accessToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
  };

  const getAccessToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  /** 获取当前用户信息（用于启动/刷新后恢复用户与货币偏好） */
  const fetchMe = async () => {
    try {
      const { data } = await request.get<UserState>('/auth/me');
      user.value = data;
    } catch {
      // Axios 拦截器已显示错误 toast，此处仅阻止传播
    }
  };

  /** 更新货币偏好（仅影响表单下拉框默认选项，不强制任何价格） */
  const updateCurrency = async (currency: Currency) => {
    try {
      const { data } = await request.patch<UserState>('/auth/me', { currency });
      user.value = data;
    } catch {
      throw new Error(i18n.global.t('auth.errors.updateFailed'));
    }
  };

  const logout = async () => {
    try {
      // 尝试通知服务端清除 Refresh Token（忽略失败）
      await request.post('/auth/logout');
    } catch {
      // 即使请求失败也清除本地状态
    }
    user.value = initialUserState;
    localStorage.removeItem(TOKEN_KEY);
  };

  return { user, login, logout, setAccessToken, getAccessToken, fetchMe, updateCurrency };
});
