import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
// import { analyzer } from 'vite-bundle-analyzer';
import VueRouter from 'vue-router/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    VueRouter({
      root: fileURLToPath(new URL('.', import.meta.url)),
    }),
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-import.d.ts',
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
    vueDevTools(),
    // analyzer(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tutorhub/schema': fileURLToPath(
        new URL('../../packages/schema/src/index.ts', import.meta.url),
      ),
    },
  },
});
