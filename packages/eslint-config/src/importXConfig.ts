/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import pluginImportX from 'eslint-plugin-import-x'
import type { ConfigArray } from 'typescript-eslint'

/* Define which rules we use out of eslint-plugin-import-x, and how. */
const ImportXConfig: ConfigArray = [
  {
    files   : ['**/*{js,ts}'],
    plugins : { 'import-x': pluginImportX, },
    rules   : {
      'import-x/export'           : 'error',
      'import-x/first'            : 'error',
      'import-x/group-exports'    : 'off',
      'import-x/max-dependencies' : [
        'error',
        {
          max               : 10,
          ignoreTypeImports : true,
        },
      ],
      'import-x/namespace'                   : 'error',
      'import-x/newline-after-import'        : 'error',
      'import-x/no-anonymous-default-export' : 'error',
      'import-x/no-default-export'           : 'warn',
      'import-x/no-deprecated'               : 'warn',
      'import-x/no-duplicates'               : [ 'error', { 'prefer-inline': true, }],
      'import-x/no-extraneous-dependencies'  : 'error',
      'import-x/no-named-as-default'         : 'error',
      'import-x/no-useless-path-segments'    : [ 'error', { noUselessIndex: true, }],
      'import-x/prefer-default-export'       : 'off',
    // 'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
    // This is not actually needed when "@typescript-eslint/no-import-type-side-effects is set.
    // Explanation here: https://github.com/import-js/eslint-plugin-import/issues/2676#issuecomment-1407107260
    },
    settings : {
      'import-x/parsers' : {
        '@typescript-eslint/parser' : ['.ts'],
        'espree'                    : ['.js'],
      },
      'import-x/resolver' : {
        typescript : createTypeScriptImportResolver({ alwaysTryTypes: true, }),
      },
    },
  },
  {
    files : ['**/*.d.ts'],
    rules : {
      'import-x/no-default-export' : 'off',
    },
  },
  {
    files : ['**/*.config.js'],
    rules : {
      'import-x/no-default-export'           : 'off',
      'import-x/no-anonymous-default-export' : 'off',
    //      'arrow-return-style/no-export-default-arrow': 'off',
    },
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default ImportXConfig
