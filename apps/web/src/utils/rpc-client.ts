import type { AppType } from '@tutorhub/api/rpc';
import { hc } from 'hono/client';
import ky, { type AfterResponseHook, type BeforeRequestHook } from 'ky';

const kyInstance = ky.create({
  timeout: 10000,
  hooks: {
    beforeRequest: [
      // ({ request }) => {
      //   // 显式添加 options 参数
      //   const token = localStorage.getItem('token');
      //   if (token) {
      //     // 在 ky 的 BeforeRequestHook 中，request 是标准的 Request 对象
      //     request.headers.set('Authorization', `Bearer ${token}`);
      //   }
      // },
    ] satisfies BeforeRequestHook[],

    afterResponse: [
      // async ({ response }) => {
      // if (!response.ok) {
      //   const errorData = await response.json().catch(() => ({}));
      //   console.error('API Error:', errorData);
      //   if (response.status === 401) {
      //     window.location.href = '/login';
      //   }
      // }
      // },
    ] satisfies AfterResponseHook[],
  },
});

export const client = hc<AppType>('http://localhost:3000/', {
  fetch: kyInstance,
});
