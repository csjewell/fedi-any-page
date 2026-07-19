import { config } from 'typescript-eslint'
import { Config } from '@csjewell-activitypub/eslint-config'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('../.gitignore', import.meta.url))

export default config(
  { ignores: [ '**/lib', '**/dist', 'node_modules', 'proposed', 'pnpm-lock.yaml', '**/*.config.{js,ts,mjs}', ] },
  Config(gitignorePath)
)
