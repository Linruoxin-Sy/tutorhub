import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [{ browser: 'chromium' }],
    },
    projects: [
      {
        extends: true,
        test: {
          include: ['apps/api/tests/**/*.test.ts'],
          alias: {
            '@': new URL('./apps/api/src', import.meta.url).pathname,
          },
        },
      },
      {
        extends: true,
        test: {
          include: ['apps/api/tests/**/*.test.ts'],
          alias: {
            '@': new URL('./apps/api/src', import.meta.url).pathname,
          },
        },
      },
      {
        extends: true,
        test: {
          include: ['packages/shared/tests/**/*.test.ts'],
          alias: {
            '@': new URL('./packages/shared/src', import.meta.url).pathname,
          },
        },
      },
    ],
  },
});
