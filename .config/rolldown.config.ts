import { defineConfig } from 'rolldown';
import { bundleAnalyzerPlugin } from 'rolldown/experimental';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: 'index.js',
  output: {
    cleanDir: true,
    dir: 'dist',
    externalLiveBindings: false,
    format: 'esm',
    sourcemap: true,
    sourcemapDebugIds: true,

  },
  tsconfig: './tsconfig.json',
  external: /^[^./](?!:[/\\])/,
  experimental: {
    chunkImportMap: true,
    chunkModulesOrder: 'module-id',
    lazyBarrel: true,
    nativeMagicString: true,
  },
  plugins: [bundleAnalyzerPlugin(), dts({ sourcemap: true, generator: 'tsgo', })],
  preserveEntrySignatures: 'strict',
  attachDebugInfo: 'full',
  logLevel: 'debug',
});

