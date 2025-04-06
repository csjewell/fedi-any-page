import { defineConfig } from 'tsup'

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  entry: ['mod.ts'],
  format: 'esm',
  outDir: 'lib',
  target: 'node22',
  splitting: false,
  sourcemap: true,
  skipNodeModulesBundle: true
})

