/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import erasableSyntaxOnly from 'eslint-plugin-erasable-syntax-only'
import * as regexp from 'eslint-plugin-regexp'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tsdoc from 'eslint-plugin-tsdoc'
import type { InfiniteDepthConfigWithExtends } from 'typescript-eslint'

/**
 * Define the configuration for the tsdoc, regexp,
 * erasable-syntax-only, and simple-import-sort plugins.
 */
const ShortConfig: Array<InfiniteDepthConfigWithExtends> = [
  erasableSyntaxOnly.configs.recommended as InfiniteDepthConfigWithExtends,
  {
    files   : ['**/*.{ts}'],
    plugins : { tsdoc, },
    rules   : {
      'tsdoc/syntax' : 'error',
    },
  },
  {
    files   : ['**/*{js,ts}'],
    plugins : { regexp, },
    rules   : regexp.configs['flat/recommended'].rules,
  },
  {
    files   : ['**/*{js,ts}'],
    plugins : { 'simple-import-sort': simpleImportSort, },
    rules   : {
      'simple-import-sort/imports' : [
        'warn',
        {
          groups : [[ '^\\u0000', '^node:', '^', '^@', '^\\.', '^\\w.*\\u0000$', '^@.*\\u0000$', '^\\..*\\u0000$' ]],
        },
      ],
      'simple-import-sort/exports' : 'error',
    },
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default ShortConfig

