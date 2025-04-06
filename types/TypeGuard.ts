/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type Activity, ActivityTypes, type AnyTransitiveActivityType, type TransitiveActivity,
} from './Activity.ts'
import { type Actor, ActorTypes } from './Actor.ts'
import {
  CollectionPageTypes, CollectionTypes, type EitherCollection, type EitherCollectionPage,
} from './Collection.ts'
import { CoreObjectTypes } from './CoreObject.ts'
import { type ExtendedObject, ExtendedObjectTypes } from './ExtendedObject.ts'
import { AllTypes, type AnyType, type TypeOrArrayWithType } from './Utility.ts'
import type { CoreObject, Entity } from './CoreUtility.ts'

/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
function isType<T extends Entity>(entity: unknown, type: string): boolean {
  if (!entity || typeof entity !== 'object') {
    return false
  }

  const entityType: string | Array<string> = (entity as T).type

  return Array.isArray(entityType) ? entityType.includes(type) : type === entityType
}

function isTypeOf<T extends Entity>(
  entity: unknown,
  types: Record<string, string>,
): boolean {
  return Object.values(types).some(type => isType<T>(entity, type))
}

export function exists(
  value: unknown,
): value is string | number | object | boolean {
  return (
    [ 'string', 'number', 'object', 'boolean' ].includes(typeof value)
    && value !== null
  )
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return isObject(value) && Object.getPrototypeOf(value) === Object.prototype
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date
}

export function isUrl(value: unknown): value is URL {
  return value instanceof URL
}

export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value)
}

export function hasType(value: unknown): value is { type: string | Array<string> } {
  return typeof value === 'object' && value !== null && 'type' in value
}

export function hasApType(
  value: unknown,
): value is { type: AnyType | TypeOrArrayWithType<AnyType> } {
  return hasType(value) && isTypeOf<Entity>(value, AllTypes)
}

export function isApEntity(value: unknown): value is Entity {
  return hasApType(value)
}

export function isApActivity(value: unknown): value is Activity {
  return isApEntity(value) && isTypeOf<Activity>(value, ActivityTypes)
}

export function isApCoreObject(value: unknown): value is CoreObject {
  return (
    isApEntity(value) && isTypeOf<CoreObject>(value, CoreObjectTypes)
  )
}

export function isApExtendedObject(value: unknown): value is ExtendedObject {
  return (
    isApEntity(value)
    && isTypeOf<ExtendedObject>(value, ExtendedObjectTypes)
  )
}

export function isApActor(value: unknown): value is Actor {
  return isApEntity(value) && isTypeOf<Actor>(value, ActorTypes)
}

export function isApCollection(value: unknown): value is EitherCollection {
  return (
    isApEntity(value)
    && isTypeOf<EitherCollection>(value, CollectionTypes)
  )
}

export function isApCollectionPage(
  value: unknown,
): value is EitherCollectionPage {
  return (
    isApEntity(value)
    && isTypeOf<EitherCollectionPage>(value, CollectionPageTypes)
  )
}

export function isApTransitiveActivity(
  value: unknown,
): value is TransitiveActivity<AnyTransitiveActivityType> {
  return (
    typeof value === 'object'
    && value !== null
    && isApActivity(value)
    && 'object' in value
  )
}

export function isApType<T extends Entity>(
  value: unknown,
  type: string,
): value is T {
  return isApEntity(value) && isType<T>(value, type)
}

export function isApTypeOf<T extends Entity>(
  value: unknown,
  comparison: Record<string, string>,
): value is T {
  return isApEntity(value) && isTypeOf<T>(value, comparison)
}
