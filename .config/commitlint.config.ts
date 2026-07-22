import { defineConfig } from 'cz-git'
import { execSync } from 'node:child_process';

const scopeMap : { [key : string] : string } = {
  'database-better-sqlite' : 'db-bsqlite',
  'database-cloudflare-d1' : 'db-d1',
  'database-mock'          : 'db-mock',
  'database-node-sqlite'   : 'db-nsqlite',
  'eslint-config'          : 'eslint-cfg',
  'general'                : 'general',
  'handlers-response'      : 'h-resp',
  'localserver-h3'         : 'svr-h3',
  'localserver-hapi'       : 'svr-hapi',
  're-pliers'              : 're-pliers',
  'types'                  : 'types',
}

const getScopes = () : string[] => {
  let uniq = new Map
  return execSync('git status -z || true')
    .toString()
    .split('\0')
    .map((r) => r.trim().split('\s+').at(1))
    .filter((r) => r !== undefined)
    .filter((r) => r.match('pnpm-lock\.yaml$') === null)
    .map((r) => {
      let dirs = r.split('/')
      if (dirs[0] !== 'packages') {
        console.log(`${r} : monorepo`)
        return 'monorepo'
      }
      if (scopeMap[dirs[1]] !== undefined) {
        console.log(`${r}: ${scopeMap[dirs[1]]}`)
        return scopeMap[dirs[1]]
      }
      console.warn(`New package ${dirs[1]} needs added to scopeMap`)
      return 'monorepo'
    })
    .filter((r) => {
      if (uniq.has(r)) {
        return false;
      }
      uniq.set(r, 1)
      return true
    })
    .sort()
}

export default defineConfig({
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    "body-case":                        [ 2, "always", "sentence-case", ],
    "body-leading-blank":               [ 2, "always", ],
    "body-max-line-length":             [ 2, "always", 80 ],
    "breaking-change-exclamation-mark": [ 2, "always", ],
    "footer-leading-blank":             [ 1, "always", ],
    "footer-max-line-length":           [ 2, "always", 80, ],
    "header-max-length":                [ 2, "always", 55, ],
    "header-trim":                      [ 2, "always", ],
    "scope-enum":                       [ 2, "always", [
        'monorepo', 'types', 'general', 're-pliers', 'svr-h3', 'svr-hapi', 'db-d1',
        'db-mock', 'db-nsqlite', 'db-bsqlite', 'eslint-cfg', 'hand-resp',
      ],
    ],
    "scope-case":                       [ 2, "always", "lower-case", ],
    "subject-case":                     [ 2, "always", "sentence-case", ],
    "subject-empty":                    [ 2, "never", ],
    "subject-full-stop":                [ 2, "never",  ".", ],
    "subject-min-length":               [ 2, "always", 5, ],
    "type-case":                        [ 2, "always", "lower-case", ],
    "type-empty":                       [ 2, "never", ],
    "type-enum":                        [ 2, "always",
      [ "build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "test", ],
    ],
  },
  prompt: {
    themeColorCode: "38;75;208",
    markBreakingChangeMode: true,
    enableMultipleScopes: true,
    confirmColorize: false,
    allowCustomIssuePrefix: false,
    defaultScope: getScopes(),
    issuePrefixes: [{ value: "Closed:", name: "Closed: Issues have been processed" }],
    scopes: [
      { name : 'monorepo',   value : 'monorepo:   Code that does not apply to a specific package', },
      { name : 'types',      value : 'types:      ', },
      { name : 'general',    value : 'general:    ', },
      { name : 're-pliers',  value : 're-pliers:  ', },
      { name : 'svr-h3',     value : 'localserver-h3', },
      { name : 'svr-hapi',   value : 'localserver-hapi', },
      { name : 'db-d1',      value : 'database-cloudflare-d1', },
      { name : 'db-mock',    value : 'database-mock', },
      { name : 'db-nsqlite', value : 'database-node-sqlite', },
      { name : 'db-bsqlite', value : 'database-better-sqlite', },
      { name : 'eslint-cfg', value : 'eslint-config', },
      { name : 'hand-resp',  value : 'handlers-response', },

    ],
    scopeEnumSeparator: ",",
    formatMessageCB: ({ type, scope, markBreaking, subject, defaultHeader, body, breaking, footer, defaultMessage }) => {
      var myFooter: string = ''
      if (footer.length) {
        myFooter = `${footer}\nCommit-Type: ${type}`
      } else {
        myFooter = `\n\nCommit-Type: ${type}`
      }
      var scopeHeader: string = ''
      if (scope.includes(',')) {
        scopeHeader = 'multiple' + markBreaking + ': '
        myFooter += `\nScopes: ${scope}`
      } else if (scope.length) {
        scopeHeader = scope + markBreaking + ': '
      }
      var msg: string = `${scopeHeader}${subject}`
      if (body.length) {
        msg += `\n\n${body}`
      }
      if (breaking.length) {
        msg += `\n\nBREAKING CHANGE: ${breaking}`
      }
      msg += myFooter
      console.warn(msg)
      return msg
    },
  }
})
