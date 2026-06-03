import { request } from '@/utils/request';
import type { LoginResponse, loginSchema } from '@tutorhub/schema';
import { z } from 'zod';

type UserState = LoginResponse['user'];

const initialUserState: UserState = {
  id: '',
  name: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  email: null,
  phone: null,
  avatarUrl: '',
};

export const useUserStore = defineStore('auth/user', () => {
  const user = ref<UserState>(initialUserState);

  const login = async (payload: z.infer<typeof loginSchema>) => {
    const { data } = await request.post<LoginResponse>('/auth/login', payload);
    user.value = data.user;
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    user.value = initialUserState;
    localStorage.removeItem('token');
  };

  return { user, login, logout };
});
