import { z } from 'zod';

import type { LoginResponse, loginSchema } from '@tutorhub/schema';

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
      throw new Error('Login failed');
    }
  };

  /** 刷新 Access Token（由 request.ts 拦截器自动调用） */
  const setAccessToken = (accessToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
  };

  const getAccessToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
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

  return { user, login, logout, setAccessToken, getAccessToken };
});
