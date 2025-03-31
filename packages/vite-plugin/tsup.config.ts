import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['vite', 'react', '@babel/parser', '@babel/traverse', '@babel/types', 'react-jsonr'],
  treeshake: true,
  target: 'es2020',
  esbuildOptions(options) {
    options.jsx = 'automatic';
    return options;
  },
}); 