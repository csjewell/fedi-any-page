/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as guard from './TypeGuard.ts'
import type { Activity, AnyTransitiveActivityType, TransitiveActivity } from './Activity.ts'
import type { Actor } from './Actor.ts'
import type { EitherCollection, EitherCollectionPage } from './Collection.ts'
import type { CoreObject, Entity } from './CoreUtility.ts'
import type { ExtendedObject } from './ExtendedObject.ts'
import type { AnyType, TypeOrArrayWithType } from './Utility.ts'

/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
export function exists(
  value: unknown,
): asserts value is string | number | object | boolean {
  if (!guard.exists(value)) {
    throw new Error(`"${ value }" is undefined or null.`)
  }
}

export function isObject(value: unknown): asserts value is object {
  if (!guard.isObject(value)) {
    throw new TypeError(`"${ value }" is not an object.`)
  }
}

export function isPlainObject(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (!guard.isPlainObject(value)) {
    throw new TypeError(`"${ value }" is not a plain object.`)
  }
}

export function isString(value: unknown): asserts value is string {
  if (!guard.isString(value)) {
    throw new TypeError(`"${ value }" is not a string.`)
  }
}

export function isNumber(value: unknown): asserts value is number {
  if (!guard.isNumber(value)) {
    throw new TypeError(`"${ value }" is not a number.`)
  }
}

export function isBoolean(value: unknown): asserts value is boolean {
  if (!guard.isBoolean(value)) {
    throw new TypeError(`"${ value }" is not a boolean.`)
  }
}

export function isDate(value: unknown): asserts value is Date {
  if (!guard.isDate(value)) {
    throw new TypeError(`"${ value }" is not a Date object.`)
  }
}

export function isUrl(value: unknown): asserts value is URL {
  if (!guard.isUrl(value)) {
    throw new Error(`"${ value }" is not a URL object.`)
  }
}

export function isArray(value: unknown): asserts value is Array<unknown> {
  if (!guard.isArray(value)) {
    throw new TypeError(`"${ value }" is not an array.`)
  }
}

export function hasType(
  value: unknown,
): asserts value is { type: string | Array<string> } {
  if (!guard.hasType(value)) {
    throw new Error(`"${ value }" has no type.`)
  }
}

export function hasApType(
  value: unknown,
): asserts value is { type: AnyType | TypeOrArrayWithType<AnyType> } {
  if (!guard.hasApType(value)) {
    throw new Error(`"${ value }" type is not an ActivityPub type.`)
  }
}

export function isApEntity(value: unknown): asserts value is Entity {
  if (!guard.isApEntity(value)) {
    throw new Error(`"${ value }" is not an ActivityPub entity.`)
  }
}

export function isApActivity(value: unknown): asserts value is Activity {
  if (!guard.isApActivity(value)) {
    throw new Error(`"${ value }" is not an Activity`)
  }
}

export function isApCoreObject(value: unknown): asserts value is CoreObject {
  if (!guard.isApCoreObject(value)) {
    throw new Error(`"${ value }" is not a Core Object`)
  }
}

export function isApExtendedObject(
  value: unknown,
): asserts value is ExtendedObject {
  if (!guard.isApExtendedObject(value)) {
    throw new Error(`"${ value }" is not an Extended Object`)
  }
}

export function isApActor(value: unknown): asserts value is Actor {
  if (!guard.isApActor(value)) {
    throw new Error(`"${ value }" is not an Actor`)
  }
}

export function isApCollection(
  value: unknown,
): asserts value is EitherCollection {
  if (!guard.isApCollection(value)) {
    throw new Error(`"${ value }" is not a Collection`)
  }
}

export function isApCollectionPage(
  value: unknown,
): asserts value is EitherCollectionPage {
  if (!guard.isApCollectionPage(value)) {
    throw new Error(`"${ value }" is not a CollectionPage`)
  }
}

export function isApTransitiveActivity(
  value: unknown,
): asserts value is TransitiveActivity<AnyTransitiveActivityType> {
  if (!guard.isApTransitiveActivity(value)) {
    throw new Error(`"${ value }" is not a Transitive Activity`)
  }
}

export function isApType<T extends Entity>(
  value: unknown,
  type: string,
): asserts value is T {
  if (!guard.isApType<T>(value, type)) {
    throw new Error(`"${ value }" is not of type ${ type }.`)
  }
}

export function isApTypeOf<T extends Entity>(
  value: unknown,
  comparison: Record<string, string>,
): asserts value is T {
  if (!guard.isApTypeOf<T>(value, comparison)) {
    throw new Error(`"${ value }" does not match any provided type.`)
  }
}
