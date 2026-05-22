import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  clean: true,
  deps: {
    neverBundle: (id) => {
      // 不打包任何 node_modules 中的模块
      return id.includes('node_modules');
    },
  },
});
