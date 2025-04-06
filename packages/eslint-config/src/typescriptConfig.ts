/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import tseslint, { type ConfigWithExtends } from 'typescript-eslint'

const TypescriptConfig: Array<ConfigWithExtends> = [
  {
    extends         : tseslint.configs.strictTypeChecked,
    files           : ['**/*{js,ts}'],
    languageOptions : {
      parser        : tseslint.parser,
      parserOptions : {
        projectService : true,
      },
    },
    rules : {
      '@typescript-eslint/array-type'     : [ 'warn', { default: 'generic', }],
      '@typescript-eslint/ban-ts-comment' : [
        'error',
        {
          'ts-expect-error' : false,
          'ts-ignore'       : true,
          'ts-nocheck'      : false,
          'ts-check'        : false,
        },
      ],
      '@typescript-eslint/consistent-type-definitions' : [ 'warn', 'type' ],
      '@typescript-eslint/consistent-type-assertions'  : 'error',
      '@typescript-eslint/consistent-type-imports'     : [ 'error', { fixStyle: 'inline-type-imports', }],
      '@typescript-eslint/consistent-type-exports'     : [
        'error',
        {
          fixMixedExportsWithInlineTypeSpecifier : true,
        },
      ],
      '@typescript-eslint/default-param-last'             : 'error',
      '@typescript-eslint/dot-notation'                   : 'error',
      '@typescript-eslint/explicit-module-boundary-types' : 'error',
      '@typescript-eslint/method-signature-style'         : 'error',
      '@typescript-eslint/no-array-constructor'           : 'off',
      '@typescript-eslint/no-empty-function'              : 'error',
      '@typescript-eslint/no-empty-object-type'           : [
        'error',
        {
          allowInterfaces : 'with-single-extends',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects' : 'error',
      '@typescript-eslint/no-inferrable-types'         : 'error',
      '@typescript-eslint/no-loop-func'                : 'error',
      '@typescript-eslint/no-non-null-assertion'       : 'warn',
      // eventually we will enable unicorn/prefer-module instead:
      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md
      '@typescript-eslint/no-require-imports'          : 'off',
      '@typescript-eslint/no-shadow'                   : [
        'error',
        {
          hoist                                      : 'all',
          allow                                      : [ 'resolve', 'reject', 'done', 'next', 'err', 'error' ],
          ignoreTypeValueShadow                      : true,
          ignoreFunctionTypeParameterNameValueShadow : true,
        },
      ],
      '@typescript-eslint/no-unsafe-assignment'  : 'off',
      '@typescript-eslint/no-unused-expressions' : [
        'error',
        {
          allowShortCircuit    : true,
          allowTernary         : true,
          allowTaggedTemplates : true,
          enforceForJSX        : true,
        },
      ],
      '@typescript-eslint/no-unused-vars' : [
        'error',
        {
          args                           : 'all',
          argsIgnorePattern              : '^_',
          caughtErrors                   : 'all',
          caughtErrorsIgnorePattern      : '^_',
          destructuredArrayIgnorePattern : '^_',
          varsIgnorePattern              : '^_',
          ignoreRestSiblings             : true,
        },
      ],
      '@typescript-eslint/no-use-before-define'      : 'error',
      '@typescript-eslint/prefer-function-type'      : 'error',
      '@typescript-eslint/prefer-nullish-coalescing' : [
        'error',
        {
          ignorePrimitives : true,
        },
      ],
      '@typescript-eslint/prefer-optional-chain'                  : 'error',
      '@typescript-eslint/prefer-string-starts-ends-with'         : 'error',
      '@typescript-eslint/switch-exhaustiveness-check'            : 'error',
      '@typescript-eslint/use-unknown-in-catch-callback-variable' : 'off',
      '@typescript-eslint/naming-convention'                      : [
        'warn',
        {
          selector           : 'default',
          format             : ['camelCase'],
          leadingUnderscore  : 'allow',
          trailingUnderscore : 'forbid',
        },
        {
          selector           : 'variable',
          types              : [ 'string', 'number' ],
          format             : [ 'camelCase', 'UPPER_CASE' ],
          modifiers          : ['const'],
          leadingUnderscore  : 'allow',
          trailingUnderscore : 'forbid',
        },
        {
          selector           : 'variable',
          types              : ['function'],
          format             : [ 'camelCase', 'PascalCase' ],
          modifiers          : ['const'],
          leadingUnderscore  : 'allow',
          trailingUnderscore : 'forbid',
        },
        {
          selector           : 'variable',
          format             : ['PascalCase'],
          modifiers          : ['exported'],
          leadingUnderscore  : 'forbid',
          trailingUnderscore : 'forbid',
        },
        {
          selector           : 'objectLiteralProperty',
          format             : null,
          leadingUnderscore  : 'allowSingleOrDouble',
          trailingUnderscore : 'forbid',
        },
        {
          selector           : 'typeLike',
          format             : ['PascalCase'],
          leadingUnderscore  : 'allow',
          trailingUnderscore : 'forbid',
        },
        {
          // https://typescript-eslint.io/rules/naming-convention/#enforce-that-boolean-variables-are-prefixed-with-an-allowed-verb
          selector           : 'variable',
          types              : ['boolean'],
          format             : [ 'PascalCase', 'camelCase' ],
          prefix             : [ 'is', 'are', 'has', 'should', 'can' ],
          leadingUnderscore  : 'allow',
          trailingUnderscore : 'forbid',
        },
        {
          selector  : 'variable',
          modifiers : ['destructured'],
          format    : null,
        },
        {
          selector : 'import',
          format   : [ 'camelCase', 'PascalCase' ],
        },
        {
          selector : 'typeProperty',
          format   : null,
        },
      ],
    },
  },
]

export default TypescriptConfig
