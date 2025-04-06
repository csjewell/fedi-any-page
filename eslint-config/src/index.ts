/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import BaseConfig from './baseConfig.ts'
import ImportXConfig from './importXConfig.ts'
import NoRestrictedConfig from './noRestrictedConfig.ts'
import ShortConfig from './shortConfig.ts'
import StylisticConfig from './stylisticConfig.ts'
import TypescriptConfig from './typescriptConfig.ts'
import UnicornConfig from './unicornConfig.ts'
import VitestConfig from './vitestConfig.ts'
import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint'

const getExportableConfig = (gitignorePath: string): Array<InfiniteDepthConfigWithExtends> => {
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

export default getExportableConfig

