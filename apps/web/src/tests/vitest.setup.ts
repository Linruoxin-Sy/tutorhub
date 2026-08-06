import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { i18n } from '@/locales';

import { worker } from '../mocks/browser';

// 每个测试前重置 i18n locale 与 localStorage，避免跨测试污染
beforeEach(() => {
  i18n.global.locale.value = 'en';
  window.localStorage.removeItem('locale');
});

// Mock IntersectionObserver for useElementInView in tests
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly scrollMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver for @tanstack/vue-virtual
class MockResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

beforeAll(async () => {
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
});
afterEach(() => worker.resetHandlers());
afterAll(() => worker.stop());
