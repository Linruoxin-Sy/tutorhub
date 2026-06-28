import { z } from 'zod';

import type { LoginResponse, loginSchema } from '@tutorhub/schema';

import { request } from '@/utils/request';

type UserState = LoginResponse['user'];

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
      localStorage.setItem('token', data.token);
    } catch {
      // Axios 拦截器已显示错误 toast，此处仅阻止传播
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    user.value = initialUserState;
    localStorage.removeItem('token');
  };

  return { user, login, logout };
});
