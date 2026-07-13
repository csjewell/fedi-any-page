import { defineConfig } from 'rolldown';
import { bundleAnalyzerPlugin } from 'rolldown/experimental';
import { dts } from 'rolldown-plugin-dts';

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
//  plugins: [dts({
//    entry: 'index.ts',
//    sourcemap: true,
//    emitDtsOnly: false,
//    resolver: 'tsc',
//    parallel: true,
//    eager: true,
//    newContext: true,
//  })],
  preserveEntrySignatures: 'strict',
  attachDebugInfo: 'full',
  logLevel: 'debug',
});

