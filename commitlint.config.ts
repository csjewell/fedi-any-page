import { defineConfig } from 'cz-git'

export default defineConfig({
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    "scope-enum": [
      2,
      "always",
      ["monorepo","types","general","re-pliers"]
    ],
    "scope-case": [
      2,
      "always",
      "lower-case"
    ],
    "body-leading-blank": [
      2,
      "always"
    ],
    "body-case": [
      2,
      "always",
      "sentence-case"
    ],
    "body-max-line-length": [
      2,
      "always",
      80
    ],
    "footer-leading-blank": [
      1,
      "always"
    ],
    "footer-max-line-length": [
      2,
      "always",
      80
    ],
    "header-max-length": [
      2,
      "always",
      55
    ],
    "header-trim": [
      2,
      "always"
    ],
    "subject-case": [
      2,
      "never",
      [
        "sentence-case",
        "start-case",
        "pascal-case",
        "upper-case"
      ]
    ],
    "subject-empty": [
      2,
      "never"
    ],
    "subject-full-stop": [
      2,
      "never",
      "."
    ],
    "type-case": [
      2,
      "always",
      "lower-case"
    ],
    "type-empty": [
      2,
      "never"
    ],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "test"
      ]
    ]
  },
  prompt: {
    themeColorCode: "38;75;208",
  }
})
