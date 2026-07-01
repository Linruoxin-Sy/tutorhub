import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import { render, type ComponentRenderOptions } from 'vitest-browser-vue';
import type { Component, Plugin } from 'vue';
import { createMemoryHistory, createRouter, type RouterOptions } from 'vue-router';

/**
 * 创建一个已清空的 QueryClient，避免测试间缓存污染
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * 创建一个用于测试的内存路由
 */
export function createTestRouter(options?: Partial<RouterOptions>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: options?.routes ?? [],
  });
  return router;
}

/**
 * 初始化测试 Pinia 实例
 */
export function initTestPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RenderWithSetupOptions<Props> extends ComponentRenderOptions<any, Props> {
  /**
   * 是否自动初始化 Pinia（默认 true）
   */
  withPinia?: boolean;
  /**
   * 是否自动注入 VueQueryPlugin（默认 false）
   */
  withQuery?: boolean;
  /**
   * 是否自动注入 router（默认 false）
   */
  withRouter?: boolean;
  /**
   * 自定义路由配置（当 withRouter 为 true 时使用）
   */
  routes?: RouterOptions['routes'];
}

/**
 * 增强的 render 函数，自动注入常用的全局插件
 */
export async function renderWithSetup<Props extends Record<string, unknown>>(
  component: Component,
  options: RenderWithSetupOptions<Props> = {},
) {
  const {
    withPinia = true,
    withQuery = false,
    withRouter: _withRouter = false,
    routes,
    global,
    ...rest
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: (Plugin | [Plugin, ...any[]])[] = [];

  if (withPinia) {
    plugins.push(initTestPinia());
  }

  if (withQuery) {
    const queryClient = createTestQueryClient();
    plugins.push([VueQueryPlugin, { queryClient }]);
  }

  if (_withRouter) {
    const router = createTestRouter({ routes });
    plugins.push(router);
  }

  return render(component, {
    ...rest,
    global: {
      ...global,
      plugins: [...plugins, ...(global?.plugins ?? [])],
    },
  });
}

/**
 * 等待异步渲染稳定
 * 用于等待 Transition、异步数据加载等
 */
export async function waitForRender(ms = 100) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建一个用于 AvatarUploader 测试的 mock File 对象
 */
export function createMockFile(name = 'test.jpg', size = 1024, type = 'image/jpeg'): File {
  const blob = new Blob([new ArrayBuffer(size)], { type });
  return new File([blob], name, { type });
}

/**
 * 本地存储 mock 工具
 */
export function mockLocalStorage(data: Record<string, string> = {}) {
  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  const store = new Map(Object.entries(data));

  Storage.prototype.getItem = vi.fn((key: string) => store.get(key) ?? null);
  Storage.prototype.setItem = vi.fn((key: string, value: string) => {
    store.set(key, value);
  });
  Storage.prototype.removeItem = vi.fn((key: string) => {
    store.delete(key);
  });

  return () => {
    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
    Storage.prototype.removeItem = originalRemoveItem;
  };
}

/**
 * matchMedia mock（用于 ThemeToggler 等依赖媒体查询的组件）
 */
export function mockMatchMedia(matches = false) {
  const originalMatchMedia = window.matchMedia;

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  return () => {
    window.matchMedia = originalMatchMedia;
  };
}
