import tseslint from "typescript-eslint"
import Config from './packages/eslint-config/src/index.ts'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default tseslint.config(
  { ignores: ["*/lib", "node_modules", "pnpm-lock.yaml", "**/*.config.{js,ts}"] },
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  Config(gitignorePath)
)
