import { defineConfig } from 'rolldown';
import Info from 'unplugin-info/rollup'

export default defineConfig({
  input: 'index.ts',
  output: {
    cleanDir: true,
    codeSplitting: false,
    file: './dist/index.js',
    externalLiveBindings: false,
    format: 'esm',
    sourcemap: true,
    sourcemapDebugIds: true,
  },
  platform: 'neutral',
  tsconfig: './tsconfig.json',
  external: /^[^./](?!:[/\\])/,
  experimental: {
    lazyBarrel: true,
    nativeMagicString: true,
  },
  plugins: [Info()],
  preserveEntrySignatures: 'strict',
});

