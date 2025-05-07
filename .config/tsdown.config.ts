import { defineConfig } from 'tsdown/config'

export default defineConfig({
  // bundle: true,
  dts: true,
  entry: ['index.ts'],
  target: 'node22',
  sourcemap: true,
  skipNodeModulesBundle: true
})

