import { getConfig } from '@csjewell-activitypub/commit-config/commitlint'
import { getFilesList } from '@csjewell-activitypub/commit-config/git'

let scopes = [{
  scope: 'monorepo',
  name: 'monorepo',
  default: true,
  description: 'Code that does not apply to a specific package',
}, {
  scope: 'types',
  name: 'types',
  directory: 'packages/types',
  description: 'ActivityPub Typescript types package',
}, {
  scope: 'general',
  name: 'general',
  directory: 'packages/general',
  description: 'Common code for re-pliers, handlers, database, and server packages',
}, {
  scope: 're-pliers',
  name: 're-pliers',
  directory: 'packages/re-pliers',
  description: 'The re-pliers Web Component',
}, {
  scope: 'hand-resp',
  name: 'handlers-response',
  directory: 'packages/handlers-response',
  description: 'TODESCRIBE',
}, {
  scope: 'svr-h3',
  name: 'localserver-h3',
  directory: 'packages/localserver-h3',
  description: 'The h3-using test server',
}, {
  scope: 'svr-hapi',
  name: 'localserver-hapi',
  directory: 'packages/localserver-hapi',
  description: 'The hapi-using test server',
}, {
  scope: 'db-d1',
  name: 'db-cloudflare-d1',
  directory: 'packages/database-cloudflare-d1',
  description: 'Database interface using Cloudflare D1',
}, {
  scope: 'db-mock',
  name: 'db-mock',
  directory: 'packages/database-mock',
  description: 'Database interface for testing',
}, {
  scope: 'db-nsqlite',
  name: 'db-node-sqlite',
  directory: 'packages/database-node-sqlite',
  description: 'Database interface using node:sqlite',
}, {
  scope: 'db-bsqlite',
  name: 'db-better-sqlite',
  directory: 'packages/database-better-sqlite',
  description: 'TODESCRIBE',
}, {
  scope: 'eslint-cfg',
  name: 'eslint-config',
  directory: 'packages/eslint-config',
  description: 'Configuration for linting',
}, {
  scope: 'commit-cfg',
  name: 'commit-config',
  directory: 'packages/commit-config',
  description: 'Configuration for committing',
}]

export default getConfig(scopes, getFilesList(['pnpm-lock.yaml']))