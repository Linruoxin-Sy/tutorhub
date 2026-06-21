import axios from 'axios';

import router from '@/router';

import { getEnv } from './env';
import { toast } from 'vue-sonner';

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
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token');
      toast.error('Unauthorized. Please log in again.');
      router.push({ name: 'auth.login' });
    }
    return Promise.reject(error);
  },
);
