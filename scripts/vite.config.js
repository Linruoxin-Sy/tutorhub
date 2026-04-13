import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export function createViteConfig(pkgDir, { watch = false } = {}) {
  const entry = path.resolve(pkgDir, 'src/index.ts');

  return defineConfig({
    plugins: [vue(), react()],
    build: {
      lib: {
        entry,
        formats: ['es', 'cjs'],
        fileName: format => `index.${format}.js`,
      },
      outDir: path.resolve(pkgDir, 'dist'),
      emptyOutDir: true,
      sourcemap: watch,
      rollupOptions: {
        external: getDeps(pkgDir),
      },
      watch: watch ? {} : null,
    },
  });
}

function getDeps(pkgDir) {
  try {
    const pkgPath = path.resolve(pkgDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    return [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})];
  } catch {
    return [];
  }
}
