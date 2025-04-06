import { defineConfig } from 'tsup'

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  entry: ['index.ts'],
  format: 'esm',
  outDir: 'dist',
  target: 'node22',
  splitting: false,
  sourcemap: true,
  skipNodeModulesBundle: true
})

