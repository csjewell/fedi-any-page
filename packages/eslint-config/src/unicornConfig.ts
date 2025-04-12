/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import type { ConfigArray } from 'typescript-eslint'

/** Define the rules from eslint-plugin-unicorn we want to follow. */
const UnicornConfig: ConfigArray = [
  {
    files           : ['**/*{js,ts}'],
    languageOptions : {
      globals : globals.builtin,
    },
    plugins : { unicorn, },
    rules   : {
      'unicorn/catch-error-name'                     : 'error',
      'unicorn/consistent-destructuring'             : 'error',
      'unicorn/consistent-empty-array-spread'        : 'error',
      'unicorn/consistent-function-scoping'          : 'error',
      'unicorn/explicit-length-check'                : 'error',
      'unicorn/no-array-push-push'                   : 'error',
      'unicorn/no-array-reduce'                      : 'error',
      'unicorn/no-await-expression-member'           : 'error',
      'unicorn/no-await-in-promise-methods'          : 'error',
      'unicorn/no-for-loop'                          : 'error',
      'unicorn/no-instanceof-array'                  : 'error',
      'unicorn/no-new-array'                         : 'error',
      'unicorn/no-new-buffer'                        : 'error',
      'unicorn/no-single-promise-in-promise-methods' : 'error',
      'unicorn/no-unused-properties'                 : 'error',
      'unicorn/no-useless-length-check'              : 'error',
      'unicorn/no-useless-spread'                    : 'error',
      'unicorn/no-useless-fallback-in-spread'        : 'error',
      'unicorn/prefer-array-index-of'                : 'error',
      'unicorn/prefer-array-flat-map'                : 'error',
      'unicorn/prefer-array-some'                    : 'error',
      'unicorn/prefer-array-find'                    : 'error',
      'unicorn/prefer-array-flat'                    : 'error',
      'unicorn/prefer-date-now'                      : 'error',
      'unicorn/prefer-default-parameters'            : 'error',
      'unicorn/prefer-event-target'                  : 'error',
      'unicorn/prefer-export-from'                   : [ 'error', { ignoreUsedVariables: true, }],
      'unicorn/prefer-includes'                      : 'error',
      'unicorn/prefer-logical-operator-over-ternary' : 'error',
      'unicorn/prefer-native-coercion-functions'     : 'error',
      'unicorn/prefer-node-protocol'                 : 'error',
      'unicorn/prefer-object-from-entries'           : 'error',
      'unicorn/prefer-prototype-methods'             : 'error',
      'unicorn/prefer-query-selector'                : 'error',
      'unicorn/prefer-set-size'                      : 'error',
      'unicorn/prefer-spread'                        : 'error',
      'unicorn/prefer-string-replace-all'            : 'error',
      'unicorn/prefer-string-slice'                  : 'error',
      'unicorn/prefer-switch'                        : [ 'error', { emptyDefaultCase: 'do-nothing-comment', }],
      'unicorn/prefer-top-level-await'               : 'error',
      'unicorn/prefer-type-error'                    : 'error',
      'unicorn/switch-case-braces'                   : 'error',
      'unicorn/throw-new-error'                      : 'error',
    },
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default UnicornConfig
