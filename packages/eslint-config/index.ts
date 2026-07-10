/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
/* eslint 'import-x/max-dependencies' : ['warn', { max: 15, ignoreTypeImports : true, }], */
import { defineConfig } from 'eslint/config'
import BaseConfig from './src/baseConfig.ts'
import ImportXConfig from './src/importXConfig.ts'
import NoRestrictedConfig from './src/noRestrictedConfig.ts'
import ShortConfig from './src/shortConfig.ts'
/* TODO: Fix this error:
Oops! Something went wrong! :(

ESLint: 10.6.0

TypeError: Cannot read properties of undefined (reading 'FunctionType')
    at Object.<anonymous> (/opt/checkouts/git.sr.ht/~csjewell/fedi-any-page/node_modules/.pnpm/eslint-plugin-sonarjs@4.1.0_eslint@10.6.0_jiti@2.7.0_/node_modules/eslint-plugin-sonarjs/cjs/S2201/rule.js:244:62)
    at Module._compile (node:internal/modules/cjs/loader:1871:14)
    at Object..js (node:internal/modules/cjs/loader:2002:10)
    at Module.load (node:internal/modules/cjs/loader:1594:32)
    at Module._load (node:internal/modules/cjs/loader:1396:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1617:12)
    at require (node:internal/modules/helpers:153:16)
    at Object.<anonymous> (/opt/checkouts/git.sr.ht/~csjewell/fedi-any-page/node_modules/.pnpm/eslint-plugin-sonarjs@4.1.0_eslint@10.6.0_jiti@2.7.0_/node_modules/eslint-plugin-sonarjs/cjs/S2201/index.js:20:17)
    at Module._compile (node:internal/modules/cjs/loader:1871:14)
*/
// import SonarConfig from './src/sonarConfig.ts'
import StylisticConfig from './src/stylisticConfig.ts'
import TypescriptConfig from './src/typescriptConfig.ts'
import UnicornConfig from './src/unicornConfig.ts'
import VitestConfig from './src/vitestConfig.ts'
import type ConfigArray from 'typescript-eslint'

/**
 * Set up the rules that we wish to use to lint our code.
 *
 * @param {string} gitignorePath - The path of the .gitignore file.
 * @returns {ConfigArray} An eslint config object.
 *
 * @remarks All files within the .gitignore file passed in are ignored and
 * not linted.
 */
export const Config = (gitignorePath: string): ConfigArray => defineConfig(
  ...BaseConfig(gitignorePath),
  ...TypescriptConfig,
  ...ShortConfig,
  //  ...SonarConfig,
  ...NoRestrictedConfig,
  ...UnicornConfig,
  ...StylisticConfig,
  ...ImportXConfig,
  ...VitestConfig,
)

