import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: 'index.ts',
  output: {
    cleanDir: false,
    codeSplitting: false,
    dir: './dist',
    externalLiveBindings: false,
    format: 'esm',
    sourcemap: true,
    sourcemapDebugIds: true,
  },
  platform: 'node',
  tsconfig: './tsconfig.json',
  external: /^[^./](?!:[/\\])/,
  experimental: {
    lazyBarrel: true,
    nativeMagicString: true,
  },
  plugins: [dts({
    entry: 'index.ts',
    sourcemap: true,
    emitDtsOnly: true,
    resolver: 'tsc',
    parallel: true,
    eager: true,
    newContext: true,
  })],
  preserveEntrySignatures: 'strict',
  attachDebugInfo: 'full',
});

