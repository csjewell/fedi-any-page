/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { AnyType, OrArray, TypeOrArrayWithType } from './Utility.ts'

/**
 * A base ActivityStreams Entity is a plain object that has at least a `type`
 * property.
 *
 * @todo Add better support for the `@context` property.
 */
export type BaseEntity<T extends AnyType> = {
  '@context'? : OrArray<URL | Record<string, URL>>
  // ActivityPub allows null.
  'id'?       : URL | null
  'type'      : T | TypeOrArrayWithType<T>
}
