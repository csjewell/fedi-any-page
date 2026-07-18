import { defineConfig } from 'cz-git'

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
        "monorepo", "types", "general", "re-pliers", "svr-h3", "svr-hapi", "db-d1",
        "db-mock", "db-nsqlite", "db-bsqlite",
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
    scopeEnumSeparator: ",",
  }
})
