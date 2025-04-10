/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import BaseConfig from './src/baseConfig.ts'
import ImportXConfig from './src/importXConfig.ts'
import NoRestrictedConfig from './src/noRestrictedConfig.ts'
import ShortConfig from './src/shortConfig.ts'
import StylisticConfig from './src/stylisticConfig.ts'
import TypescriptConfig from './src/typescriptConfig.ts'
import UnicornConfig from './src/unicornConfig.ts'
import VitestConfig from './src/vitestConfig.ts'
import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint'

const getExportableConfig = (
  gitignorePath: string,
): Array<InfiniteDepthConfigWithExtends> => {
  const exportableConfig: Array<InfiniteDepthConfigWithExtends> = [
    ...BaseConfig(gitignorePath),
    ...TypescriptConfig,
    ...ShortConfig,
    ...NoRestrictedConfig,
    ...UnicornConfig,
    ...StylisticConfig,
    ...ImportXConfig,
    ...VitestConfig,
  ]

  return exportableConfig
}

/* eslint-disable-next-line import-x/no-default-export */
export default getExportableConfig
