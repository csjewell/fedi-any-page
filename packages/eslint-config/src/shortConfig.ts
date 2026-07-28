/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import erasableSyntaxOnly from 'eslint-plugin-erasable-syntax-only'
import packageJson from 'eslint-plugin-package-json'
import * as regexp from 'eslint-plugin-regexp'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tsdoc from 'eslint-plugin-tsdoc'
import yml from 'eslint-plugin-yml'
import type { ConfigWithExtends, ConfigWithExtendsArray } from '@eslint/config-helpers'

/**
 * Define the configuration for the tsdoc, regexp,
 * erasable-syntax-only, and simple-import-sort plugins.
 */
const ShortConfig: ConfigWithExtendsArray = [
  erasableSyntaxOnly.configs.recommended as ConfigWithExtends,
  yml.configs['flat/recommended'],
  packageJson.configs.recommended,
  {
    rules : {
      // See https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/issues/1019
      'package-json/valid-package-definition' : 'off',
    },
  },
  {
    files   : ['**/*.{ts}'],
    plugins : { tsdoc, },
    rules   : {
      'tsdoc/syntax' : 'error',
    },
  },
  {
    files   : ['**/*.{js,ts}'],
    plugins : { regexp, },
    rules   : {

      // ESLint core rules
      'no-control-regex'              : 'off',
      'regexp/no-control-character'   : 'error',
      'no-misleading-character-class' : 'error',
      'no-regex-spaces'               : 'error',
      'prefer-regex-literals'         : 'error',
      // The ESLint rule will report fewer cases than our rule
      'no-invalid-regexp'             : 'off',
      'no-useless-backreference'      : 'off',
      'no-empty-character-class'      : 'off',

      // eslint-plugin-regexp rules
      'regexp/confusing-quantifier'                 : 'warn',
      'regexp/control-character-escape'             : 'error',
      'regexp/match-any'                            : 'error',
      'regexp/negation'                             : 'error',
      'regexp/no-contradiction-with-assertion'      : 'error',
      'regexp/no-dupe-characters-character-class'   : 'error',
      'regexp/no-dupe-disjunctions'                 : 'error',
      'regexp/no-empty-alternative'                 : 'warn',
      'regexp/no-empty-capturing-group'             : 'error',
      'regexp/no-empty-character-class'             : 'error',
      'regexp/no-empty-group'                       : 'error',
      'regexp/no-empty-lookarounds-assertion'       : 'error',
      'regexp/no-empty-string-literal'              : 'error',
      'regexp/no-escape-backspace'                  : 'error',
      'regexp/no-extra-lookaround-assertions'       : 'error',
      'regexp/no-invalid-regexp'                    : 'error',
      'regexp/no-invisible-character'               : 'error',
      'regexp/no-lazy-ends'                         : 'warn',
      'regexp/no-legacy-features'                   : 'error',
      'regexp/no-misleading-capturing-group'        : 'error',
      'regexp/no-misleading-unicode-character'      : 'error',
      'regexp/no-missing-g-flag'                    : 'error',
      'regexp/no-non-standard-flag'                 : 'error',
      'regexp/no-obscure-range'                     : 'error',
      'regexp/no-optional-assertion'                : 'error',
      'regexp/no-potentially-useless-backreference' : 'warn',
      'regexp/no-super-linear-backtracking'         : 'error',
      'regexp/no-trivially-nested-assertion'        : 'error',
      'regexp/no-trivially-nested-quantifier'       : 'error',
      'regexp/no-unused-capturing-group'            : 'error',
      'regexp/no-useless-assertions'                : 'error',
      'regexp/no-useless-backreference'             : 'error',
      'regexp/no-useless-character-class'           : 'error',
      'regexp/no-useless-dollar-replacements'       : 'error',
      'regexp/no-useless-escape'                    : 'error',
      'regexp/no-useless-flag'                      : 'warn',
      'regexp/no-useless-lazy'                      : 'error',
      'regexp/no-useless-non-capturing-group'       : 'error',
      'regexp/no-useless-quantifier'                : 'error',
      'regexp/no-useless-range'                     : 'error',
      'regexp/no-useless-set-operand'               : 'error',
      'regexp/no-useless-string-literal'            : 'error',
      'regexp/no-useless-two-nums-quantifier'       : 'error',
      'regexp/no-zero-quantifier'                   : 'error',
      'regexp/optimal-lookaround-quantifier'        : 'warn',
      'regexp/optimal-quantifier-concatenation'     : 'error',
      'regexp/prefer-character-class'               : 'error',
      'regexp/prefer-d'                             : 'error',
      'regexp/prefer-plus-quantifier'               : 'error',
      'regexp/prefer-predefined-assertion'          : 'error',
      'regexp/prefer-question-quantifier'           : 'error',
      'regexp/prefer-range'                         : 'error',
      'regexp/prefer-set-operation'                 : 'error',
      'regexp/prefer-star-quantifier'               : 'error',
      'regexp/prefer-unicode-codepoint-escapes'     : 'error',
      'regexp/prefer-w'                             : 'error',
      'regexp/simplify-set-operations'              : 'error',
      'regexp/sort-flags'                           : 'error',
      'regexp/strict'                               : 'error',
      'regexp/use-ignore-case'                      : 'error',

      'regexp/no-super-linear-move'                  : 'warn',
      'regexp/no-octal'                              : 'error',
      'regexp/no-standalone-backslash'               : 'error',
      'regexp/prefer-escape-replacement-dollar-char' : 'error',
      // typescript-exec might have this on.
      'regexp/prefer-regexp-exec'                    : 'off',
      'regexp/sort-alternatives'                     : 'warn',
      'regexp/grapheme-string-literal'               : 'error',
      'regexp/sort-character-class-elements'         : 'error',

      /*
      https://ota-meshi.github.io/eslint-plugin-regexp/rules/letter-case.html - configure...
      https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-lookaround.html
      */
    },
  },
  {
    files   : ['**/*.{js,ts}'],
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

