/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import createNoRestrictedProperties from 'eslint-no-restricted/properties'
import createNoRestrictedSyntax from 'eslint-no-restricted/syntax'
import type { ConfigWithExtendsArray, ExtendsElement } from '@eslint/config-helpers'

const noRestrictedSyntax = createNoRestrictedSyntax(
  {
    selector : 'LabeledStatement',
    name     : 'noLabels',
    message :
      'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
  },
  {
    selector : 'ForInStatement',
    name     : 'noForInLoops',
    message :
      'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
  },
  {
    selector : "Identifier[name='Reflect']",
    name     : 'noReflect',
    message :
      'Avoid the Reflect API. It is a very low-level feature that has only rare and specific use-cases if building complex and hacky libraries. There is no need to use this feature for any kind of normal development.',
  },
  {
    selector : "Identifier[name='Proxy']",
    name     : 'noProxy',
    message  : 'Avoid Proxy.',
  },
  // this needs to be temporarily disabled because of a Typescript limitation with discriminated unions. See: https://github.com/microsoft/TypeScript/issues/44253.
  // {
  //   selector: "BinaryExpression[operator='in']",
  //   name: 'noInOperator',
  //   message:
  //     "Avoid the 'in' operator. In real-world scenarios there is rarely a need for this operator. For most usecases, basic property access is all you need. For every other case, use the Object.hasOwn() or the Object.prototype.hasOwnProperty() method. In the really niche cases where you actually need to check for the existence of a property both in the object itself AND in it's prototype chain, feel free to disable this rule with the inline eslint-disable syntax.",
  // },
  {
    selector : [ "Identifier[name='PropTypes']", "Identifier[name='propTypes']" ],
    name     : 'noPropTypes',
    message  : 'Avoid PropTypes. Use Typescript instead.',
  },
  {
    selector : "UnaryExpression[operator='delete']",
    name     : 'noDeleteOperator',
    message  : 'Avoid the "delete" operator. Use omit() instead.',
  },
  {
    selector : 'TSEnumDeclaration',
    name     : 'noEnums',
    message  : 'Avoid enums.',
  },
)

const noRestrictedProperties = createNoRestrictedProperties(
  {
    name     : 'isFinite',
    message  : 'Please use Number.isFinite instead',
    property : [
      {
        object   : 'global',
        property : 'isFinite',
      },
      {
        object   : 'self',
        property : 'isFinite',
      },
      {
        object   : 'window',
        property : 'isFinite',
      },
    ],
  },
  {
    name     : 'isNaN',
    message  : 'Please use Number.isNaN instead',
    property : [
      {
        object   : 'global',
        property : 'isNaN',
      },
      {
        object   : 'self',
        property : 'isNaN',
      },
      {
        object   : 'window',
        property : 'isNaN',
      },
    ],
  },
)

/** Define what syntax and properties we restrict ourselves from using. */
const NoRestrictedConfig: ConfigWithExtendsArray = [
  {
    extends : [noRestrictedSyntax.configs.recommended as ExtendsElement],
    files   : ['**/*.{js,ts}'],
  },
  {
    extends : [noRestrictedProperties.configs.recommended as ExtendsElement],
    files   : ['**/*.{js,ts}'],
  },
]

/* eslint-disable-next-line import-x/no-default-export */
export default NoRestrictedConfig
