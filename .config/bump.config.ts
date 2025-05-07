// run 'pnpx bumpp'
import { defineConfig } from 'bumpp'

export default defineConfig({
  commit: 'chore: bump version to v',
  push: false,
  tag: false,
  sign: false,
  install: false,
  recursive: false,
  noVerify: true,
  confirm: true,
  ignoreScripts: false,
  all: false,
  noGitCheck: false,
  files: [
    'package.json',
    'packages/*/jsr.jsonc',
    'packages/*/package.json',
    'packages/general/src/server/nodeinfo21.ts'
  ],
})
