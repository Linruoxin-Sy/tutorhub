import ky, { type AfterResponseHook, type BeforeRequestHook } from 'ky';

const beforeRequestHooks: BeforeRequestHook[] = [
  // ({ request }) => {
  //   // 显式添加 options 参数
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     // 在 ky 的 BeforeRequestHook 中，request 是标准的 Request 对象
  //     request.headers.set('Authorization', `Bearer ${token}`);
  //   }
  // },
];

const afterResponseHooks: AfterResponseHook[] = [
  // async ({ response }) => {
  // if (!response.ok) {
  //   const errorData = await response.json().catch(() => ({}));
  //   console.error('API Error:', errorData);
  //   if (response.status === 401) {
  //     window.location.href = '/login';
  //   }
  // }
  // },
];

export const apiClient = ky.create({
  timeout: 10000,
  hooks: {
    beforeRequest: beforeRequestHooks,
    afterResponse: afterResponseHooks,
  },
});
