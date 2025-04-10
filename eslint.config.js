import tseslint from 'typescript-eslint'
import Config from './packages/eslint-config/index.ts'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default tseslint.config(
  { ignores: ['**/lib', '**/dist', 'node_modules', 'proposed', 'docsite', 'pnpm-lock.yaml', '**/*.config.{js,ts}'] },
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  Config(gitignorePath)
)
