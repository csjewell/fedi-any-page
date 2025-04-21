/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { config, type ConfigArray } from 'typescript-eslint'
import BaseConfig from './src/baseConfig.ts'
import ImportXConfig from './src/importXConfig.ts'
import NoRestrictedConfig from './src/noRestrictedConfig.ts'
import ShortConfig from './src/shortConfig.ts'
import SonarConfig from './src/sonarConfig.ts'
import StylisticConfig from './src/stylisticConfig.ts'
import TypescriptConfig from './src/typescriptConfig.ts'
import UnicornConfig from './src/unicornConfig.ts'
import VitestConfig from './src/vitestConfig.ts'

/**
 * Set up the rules that we wish to use to lint our code.
 *
 * @param {string} gitignorePath - The path of the .gitignore file.
 * @returns {ConfigArray} An eslint config object.
 *
 * @remarks All files within the .gitignore file passed in are ignored and
 * not linted.
 */
export const Config = (gitignorePath: string): ConfigArray => config([
  ...BaseConfig(gitignorePath),
  ...TypescriptConfig,
  ...ShortConfig,
  ...SonarConfig,
  ...NoRestrictedConfig,
  ...UnicornConfig,
  ...StylisticConfig,
  ...ImportXConfig,
  ...VitestConfig,
])

