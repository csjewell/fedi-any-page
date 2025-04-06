/* SPDX-License-Identifier: MIT */
import { CoreObjectTypes } from './CoreObject.ts'
import { LinkTypes } from './Link.ts'

/**
 * All the types of Entities.
 *
 * @see Entity
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#dfn-object
 * @see https://www.w3.org/TR/activitypub/#object
 * @see https://www.w3.org/TR/activitystreams-core/#object
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#dfn-link
 * @see https://www.w3.org/TR/activitypub/#link
 * @see https://www.w3.org/TR/activitystreams-core/#link
 */
export const AllTypes = {
  ...CoreObjectTypes,
  ...LinkTypes,
} as const

/**
 * Shorthand for a plain object with string keys and string values.
 */
export type StringReferenceMap = Record<string, string>

/**
 * Shorthand for a value of a given type or array of values that all conform
 * to that type.
 *
 * This is useful internally to represent many ActivityPub properties.
 *
 * @param T The type of the value to be mapped.
 *
 * @example
 * ```ts
 * // A string or array of strings.
 * type StringOrArrayOfStrings = OrArray<string>;
 *
 * const a: StringOrArrayOfStrings = 'foo';
 * const b: StringOrArrayOfStrings = ['foo', 'bar'];
 * ```
 */
export type OrArray<T> = T | Array<T>
/**
 * A union of all Entity types.
 */
export type AnyType = (typeof AllTypes)[keyof typeof AllTypes]

/**
 * A type alias representing the provided ActivityPub type or an array of
 * ActivityPub types which includes the provided type.
 *
 * @param T The type to be used. The type must be a valid ActivityPub type.
 *
 * @example
 * ```ts
 * // A single type.
 * const a: TypeOrArrayWithType<'Article'> = 'Article';
 *
 * // An array of types.
 * const b: TypeOrArrayWithType<'Article'> = ['Article', 'Note'];
 * ```
 *
 * @note This type is used to represent the `type` property of an ActivityPub
 * object. The `type` property can be a single type or an array of types.
 *
 * @note Having multiple types in the `type` property is permitted in JSON-LD,
 * however some ActivityPub implementations may not support it. For this reason,
 * it is recommended to only use a single type. Internally, the first type in
 * the array will be used as the primary type.
 *
 * @note Additional non-ActivityPub types may be included in the array, but
 * they will not be validated.
 */
export type TypeOrArrayWithType<T extends AnyType> = T | [T, ...Array<AnyType>,]
