import { afterAll, afterEach, beforeAll } from 'vitest';

import { worker } from './src/mocks/browser';

// Mock IntersectionObserver for useElementInView in tests
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
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
