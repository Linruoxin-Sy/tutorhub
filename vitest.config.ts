import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const createProject = (root: string) => ({
  extends: true as const,
  test: {
    include: [`${root}/**/tests/**/*.{test,spec}.ts`],
    alias: {
      '@': new URL(`./${root}/src`, import.meta.url).pathname,
    },
  },
});

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
      createProject('apps/api'),
      createProject('apps/web'),
      createProject('packages/shared'),
    ],
  },
});
