import { defineConfig } from 'tsup';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  entry: Object.fromEntries(
    globSync(['src/**/*.{ts,tsx}']).map((file) => [
      file.startsWith('src/') ?
        path.relative(
          'src',
          file.slice(0, file.length - path.extname(file).length)
        ) :
        path.basename(file, path.extname(file)),
      fileURLToPath(new URL(file, import.meta.url))
    ])
  ),
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-jsonr'],
  esbuildOptions(options) {
    options.banner = {
      js: '/* React-JSONR Event Handlers Plugin - Maps string event handlers to functions */',
    };
  },
}); 