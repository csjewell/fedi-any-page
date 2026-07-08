/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import stylistic from '@stylistic/eslint-plugin'
import type { ConfigArray } from 'typescript-eslint'

/** Define the style rules we want to follow. */
const StylisticConfig: ConfigArray = [
  {
    files   : ['**/*.{js,ts}'],
    plugins : { '@stylistic': stylistic, },
    rules   : {
      '@stylistic/array-bracket-newline' : [ 'warn', { multiline: true, }],
      '@stylistic/array-bracket-spacing' : [
        'error',
        'always',
        {
          objectsInArrays : false,
          singleValue     : false,
        },
      ],
      '@stylistic/array-element-newline' : [
        'warn',
        {
          consistent : true,
          multiline  : true,
        },
      ],
      '@stylistic/arrow-parens' : [
        'error',
        'as-needed',
        {
          requireForBlockBody : true,
        },
      ],
      '@stylistic/arrow-spacing' : 'error',
      '@stylistic/block-spacing' : 'error',
      '@stylistic/brace-style'   : [ 'error', '1tbs', { allowSingleLine: true, }],
      '@stylistic/comma-dangle'  : [
        'error',
        {
          arrays           : 'always-multiline',
          objects          : 'always',
          imports          : 'always-multiline',
          exports          : 'always-multiline',
          functions        : 'always-multiline',
          importAttributes : 'never',
          dynamicImports   : 'never',
          generics         : 'never',
          tuples           : 'always',
        },
      ],
      '@stylistic/comma-spacing'         : 'error',
      '@stylistic/comma-style'           : 'error',
      '@stylistic/eol-last'              : [ 'error', 'always' ],
      '@stylistic/function-call-spacing' : [ 'error', 'never' ],
      '@stylistic/indent'                : [ 'error', 2 ],
      '@stylistic/indent-binary-ops'     : [ 'error', 2 ],
      '@stylistic/key-spacing'           : [
        'error',
        {
          singleLine : {
            beforeColon : false,
            afterColon  : true,
          },
          multiLine : {
            beforeColon : true,
            afterColon  : true,
            align       : 'colon',
          },
        },
      ],
      '@stylistic/keyword-spacing'                  : 'error',
      '@stylistic/line-comment-position'            : 'error',
      '@stylistic/multiline-ternary'                : [ 'error', 'always-multiline' ],
      '@stylistic/new-parens'                       : 'error',
      '@stylistic/newline-per-chained-call'         : [ 'error', { ignoreChainWithDepth: 3, }],
      '@stylistic/no-extra-parens'                  : 'error',
      '@stylistic/no-extra-semi'                    : 'error',
      '@stylistic/no-floating-decimal'              : 'error',
      '@stylistic/no-mixed-operators'               : 'error',
      '@stylistic/no-multiple-empty-lines'          : 'error',
      '@stylistic/no-trailing-spaces'               : 'error',
      '@stylistic/no-whitespace-before-property'    : 'error',
      '@stylistic/nonblock-statement-body-position' : 'error',
      '@stylistic/one-var-declaration-per-line'     : [ 'error', 'initializations' ],
      '@stylistic/operator-linebreak'               : [ 'error', 'before' ],
      '@stylistic/padded-blocks'                    : [
        'error',
        'never',
        {
          allowSingleLineBlocks : true,
        },
      ],
      '@stylistic/padding-line-between-statements' : [
        'error',
        // blank lines after every sequence of variable declarations, like the newline-after-var rule.
        { blankLine: 'always', prev: [ 'const', 'let' ], next: '*', },
        { blankLine: 'any', prev: [ 'const', 'let' ], next: [ 'const', 'let' ], },
        //require blank lines before any return statements, unless it's just a basic expression.
        { blankLine: 'always', prev: '*', next: 'return', },
        { blankLine: 'never', prev: ['expression'], next: 'return', },
        { blankLine: 'never', prev: ['multiline-expression'], next: 'return', },
      ],
      '@stylistic/quote-props'         : [ 'error', 'consistent-as-needed' ],
      '@stylistic/quotes'              : [ 'error', 'single', { avoidEscape: true, }],
      '@stylistic/rest-spread-spacing' : 'error',
      '@stylistic/semi'                : [
        'error',
        'never',
        {
          beforeStatementContinuationChars : 'always',
        },
      ],
      '@stylistic/semi-style'                  : [ 'error', 'last' ],
      '@stylistic/space-before-blocks'         : 'error',
      '@stylistic/space-infix-ops'             : [ 'error', { int32Hint: true, ignoreTypes: false, }],
      '@stylistic/space-unary-ops'             : 'error',
      '@stylistic/switch-colon-spacing'        : 'error',
      '@stylistic/template-curly-spacing'      : [ 'error', 'always' ],
      '@stylistic/template-tag-spacing'        : 'error',
      // '@stylistic/type-annotation-spacing'  : 'error', // This causes a fix loop with key-spacing...
      '@stylistic/type-generic-spacing'        : 'error',
      // TODO: Error with eslint?
      // '@stylistic/type-named-tuple-spacing' : 'error',
      '@stylistic/wrap-regex'                  : 'error',
      '@stylistic/space-before-function-paren' : [
        'error',
        {
          anonymous  : 'always',
          named      : 'never',
          asyncArrow : 'always',
        },
      ],
    },
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default StylisticConfig

