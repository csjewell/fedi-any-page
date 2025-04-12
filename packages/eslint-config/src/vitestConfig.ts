/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import vitest from '@vitest/eslint-plugin'
import type { ConfigArray } from 'typescript-eslint'

/** Define the rules from eslint-plugin-vitest we want out tests to follow. */
const VitestConfig: ConfigArray = [
  {
    files : [
      '**/*.{test,spec}.{js,ts}',
      '**/tests/**/*.{js,ts}',
      '**/__tests__/**/*.{js,ts}',
    ],
    plugins : {
      vitest,
    },
    rules : {
      'vitest/consistent-test-it'            : [ 'error', { fn: 'test', withinDescribe: 'test', }],
      'vitest/expect-expect'                 : 'error',
      'vitest/no-commented-out-tests'        : 'error',
      'vitest/no-conditional-expect'         : 'error',
      'vitest/no-conditional-in-test'        : 'error',
      'vitest/no-disabled-tests'             : 'error',
      'vitest/no-duplicate-hooks'            : 'error',
      'vitest/no-identical-title'            : 'error',
      'vitest/no-focused-tests'              : 'error',
      'vitest/no-standalone-expect'          : 'error',
      'vitest/no-test-prefixes'              : 'error',
      'vitest/no-test-return-statement'      : 'error',
      'vitest/prefer-comparison-matcher'     : 'error',
      'vitest/prefer-each'                   : 'error',
      'vitest/prefer-equality-matcher'       : 'error',
      'vitest/prefer-expect-resolves'        : 'error',
      'vitest/prefer-hooks-in-order'         : 'error',
      'vitest/prefer-hooks-on-top'           : 'error',
      'vitest/prefer-lowercase-title'        : 'error',
      'vitest/prefer-mock-promise-shorthand' : 'error',
      'vitest/prefer-spy-on'                 : 'error',
      'vitest/prefer-strict-equal'           : 'error',
      'vitest/prefer-to-be'                  : 'error',
      'vitest/prefer-to-be-falsy'            : 'error',
      'vitest/prefer-to-be-object'           : 'error',
      'vitest/prefer-to-be-truthy'           : 'error',
      'vitest/prefer-to-contain'             : 'error',
      'vitest/prefer-to-have-length'         : 'error',
      'vitest/prefer-todo'                   : 'error',
      'vitest/require-hook'                  : 'error',
      'vitest/require-to-throw-message'      : 'error',
      'vitest/require-top-level-describe'    : 'error',
      'vitest/valid-describe-callback'       : 'error',
      'vitest/valid-expect'                  : 'error',
    },
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default VitestConfig

