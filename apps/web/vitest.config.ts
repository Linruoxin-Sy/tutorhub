import { fileURLToPath, URL } from 'node:url';

import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-import.d.ts',
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tutorhub/schema': fileURLToPath(
        new URL('../../packages/schema/src/index.ts', import.meta.url),
      ),
      'vue-router/auto-routes': fileURLToPath(
        new URL('./src/mocks/auto-routes-stub.ts', import.meta.url),
      ),
    },
  },
  test: {
    setupFiles: ['vitest-browser-vue', './vitest.setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [{ browser: 'chromium' }],
    },
  },
});
