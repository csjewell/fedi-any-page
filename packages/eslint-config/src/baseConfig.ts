/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { includeIgnoreFile } from 'eslint/config'
import globals from 'globals'
import tseslint, { type ConfigArray } from 'typescript-eslint'
import * as yamlParser from 'yaml-eslint-parser'
import eslintJs from '@eslint/js'

const confusingBrowserGlobals = [
  'addEventListener',
  'blur',
  'close',
  'closed',
  'confirm',
  'defaultStatus',
  'defaultstatus',
  'event',
  'external',
  'find',
  'focus',
  'frameElement',
  'frames',
  'history',
  'innerHeight',
  'innerWidth',
  'length',
  'location',
  'locationbar',
  'menubar',
  'moveBy',
  'moveTo',
  'name',
  'onblur',
  'onerror',
  'onfocus',
  'onload',
  'onresize',
  'onunload',
  'open',
  'opener',
  'opera',
  'outerHeight',
  'outerWidth',
  'pageXOffset',
  'pageYOffset',
  'parent',
  'print',
  'removeEventListener',
  'resizeBy',
  'resizeTo',
  'screen',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scroll',
  'scrollbars',
  'scrollBy',
  'scrollTo',
  'scrollX',
  'scrollY',
  'self',
  'status',
  'statusbar',
  'stop',
  'toolbar',
  'top',
]

/**
 * Define what rules we use that come from ESLint itself.
 * @param gitIgnorePath The path of the .gitignore file.
 *
 * Note: All files within the .gitconfig are ignored.
 */
const BaseConfig = (gitignorePath: string): ConfigArray => [
  includeIgnoreFile(gitignorePath),
  {
    extends : [eslintJs.configs.recommended],
    files   : ['**/*.js'],
  },
  {
    linterOptions : {
      reportUnusedDisableDirectives : 'error',
    },
    languageOptions : {
      globals       : globals.nodeBuiltin,
      parser        : tseslint.parser,
      parserOptions : {
        projectService : {
          allowDefaultProject : [ '.config/helpers/*.js', 'bin/*.js', 'bin/*.ts' ],
        },
      },
    },
  },
  {
    files           : ['packages/re-pliers/**/*.{js,ts}'],
    languageOptions : {
      globals : globals.browser,
    },
  },
  {
    files           : ['**/*.{js,ts}'],
    languageOptions : {
      sourceType : 'module',
    },
  },
  {
    files           : ['*.yaml, *.yml'],
    languageOptions : {
      parser        : yamlParser,
      parserOptions : {
        defaultYAMLVersion : '1.2',
      },
    },
  },
  {
    files : ['**/*.{js,ts}'],
    rules : {
      'array-callback-return'        : [ 'error', { allowImplicit: true, checkForEach: true, }],
      'curly'                        : [ 'error', 'all' ],
      'eqeqeq'                       : 'error',
      'func-style'                   : 'error',
      'logical-assignment-operators' : [ 'error', 'never' ],
      'no-array-constructor'         : 'error',
      'no-caller'                    : 'error',
      'no-console'                   : [
        'error',
        {
          allow : [ 'warn', 'error', 'debug', 'info', 'table' ],
        },
      ],
      'no-constant-binary-expression' : 'error',
      'no-else-return'                : [ 'error', { allowElseIf: false, }],
      'no-eval'                       : 'error',
      'no-extend-native'              : 'error',
      'no-extra-bind'                 : 'error',
      'no-extra-label'                : 'error',
      'no-implicit-coercion'          : 'error',
      'no-lone-blocks'                : 'error',
      'no-multi-assign'               : 'error',
      'no-multi-str'                  : 'error',
      'no-negated-condition'          : 'error',
      'no-nested-ternary'             : 'error',
      'no-new-wrappers'               : 'error',
      'no-object-constructor'         : 'error',
      'no-octal-escape'               : 'error',
      'no-param-reassign'             : 'error',
      'no-plusplus'                   : 'error',
      'no-promise-executor-return'    : 'error',
      'no-proto'                      : 'error',
      'no-redeclare'                  : 'error',
      'no-restricted-globals'         : [ 'error', ...confusingBrowserGlobals ],
      'no-restricted-imports'         : [
        'error',
        {
          paths : [
            {
              name    : 'prop-types',
              message : 'Dont use prop-types. Use Typescript instead.',
            },
          ],
          patterns : [
            {
              group             : ['node_modules'],
              message           : 'Imports from node_modules are likely a user mistake.',
              // this is to allow side-effects imports. See: https://github.com/eslint/eslint/pull/18997.
              importNamePattern : '^',
              /*
        }, {
          group: ['dist'],
          message: 'Imports from dist are likely a user mistake.',
          // this is to allow side-effects imports. See: https://github.com/eslint/eslint/pull/18997.
          importNamePattern: '^',
        */
            },
          ],
        },
      ],
      'no-return-assign'             : [ 'error', 'always' ],
      'no-sequences'                 : [ 'error', { allowInParentheses: false, }],
      'no-unmodified-loop-condition' : 'error',
      'no-unneeded-ternary'          : [ 'error', { defaultAssignment: false, }],
      'no-unreachable-loop'          : 'error',
      'no-useless-assignment'        : 'error',
      'no-useless-call'              : 'error',
      'no-useless-computed-key'      : 'error',
      'no-void'                      : [ 'error', { allowAsStatement: true, }],
      'object-shorthand'             : 'error',
      'operator-assignment'          : [ 'error', 'always' ],
      'prefer-arrow-callback'        : 'error',
      'prefer-destructuring'         : [
        'warn',
        {
          VariableDeclarator   : { array: false, object: true, },
          AssignmentExpression : { array: false, object: false, },
        },
        { enforceForRenamedProperties: false, },
      ],
      'prefer-object-has-own'  : 'error',
      'prefer-object-spread'   : 'error',
      'prefer-rest-params'     : 'error',
      'prefer-template'        : 'error',
      'require-atomic-updates' : 'error',
      'strict'                 : [ 'error', 'never' ],

      // we were using the eslint-plugin-arrow-return-style version of this rule.
      'arrow-body-style'      : 'off',
      /* we are using the @typescript/eslint version of the rules below */
      'default-param-last'    : 'off',
      'dot-notation'          : 'off',
      'no-empty-function'     : 'off',
      'no-return-await'       : 'off',
      'no-shadow'             : 'off',
      'no-use-before-define'  : 'off',
      'no-unused-expressions' : 'off',
    },
  },
] as ConfigArray

/* eslint-disable-next-line import-x/no-default-export */
export default BaseConfig

