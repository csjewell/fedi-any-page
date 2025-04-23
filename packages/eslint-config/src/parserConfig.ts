/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import tseslint, { type ConfigArray } from 'typescript-eslint'
import yml from 'yaml-eslint-parser'

/** Define the rules from typescript-eslint we want to follow. */
const ParserConfig: ConfigArray = [
  {
    languageOptions : {
      parser        : tseslint.parser,
      parserOptions : {
        projectService : {
          allowDefaultProject : [ '.config/helpers/*.js', 'bin/*.js' ],
        },
      },
    },
  },
  {
    files           : ['*.yaml, *.yml'],
    languageOptions : {
      parser        : yml,
      parserOptions : {
        defaultYAMLVersion : '1.2',
      },
    },
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default ParserConfig
