import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [vue()],
  test: {
    projects: [
      {
        test: {
          globals: true,
          include: ['packages/**/tests/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            // https://vitest.dev/config/browser/playwright
            instances: [{ browser: 'chromium' }],
          },
          alias: {
            '@': fileURLToPath(new URL('./packages/shared/src', import.meta.url)),
          },
        },
      },
    ],
  },
});
