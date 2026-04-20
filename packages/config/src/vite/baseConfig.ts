import { resolve } from 'path';
import { defineConfig, UserConfig } from 'vite';

export const createBaseConfig = (packageDir: string): UserConfig =>
  defineConfig({
    build: {
      lib: {
        entry: resolve(packageDir, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: format => `index.${format}.js`,
      },
      outDir: resolve(packageDir, 'dist'),
      emptyOutDir: true,
      sourcemap: true,
    },
  });
