import type { Actor } from './Actor.ts'
import type { Activity, AnyTransitiveActivityType, TransitiveActivity } from './Activity.ts'
import type { EitherCollection, EitherCollectionPage } from './Collection.ts'
import type { CoreObject, Entity } from './CoreUtility.ts'
import type { ExtendedObject } from './ExtendedObject.ts'
import type { AnyType, TypeOrArrayWithType } from './Utility.ts'
import * as guard from './TypeGuard.ts'

export function exists(value: unknown): unknown | undefined {
  return guard.exists(value) ? value : undefined
}

export function isObject(value: unknown): object | undefined {
  return guard.isObject(value) ? value : undefined
}

export function isPlainObject(value: unknown): object | undefined {
  return guard.isPlainObject(value) ? value : undefined
}

export function isString(value: unknown): string | undefined {
  return guard.isString(value) ? value : undefined
}

export function isBoolean(value: unknown): boolean | undefined {
  return guard.isBoolean(value) ? value : undefined
}

export function isNumber(value: unknown): number | undefined {
  return guard.isNumber(value) ? value : undefined
}

export function isDate(value: unknown): Date | undefined {
  return guard.isDate(value) ? value : undefined
}

export function isUrl(value: unknown): URL | undefined {
  return guard.isUrl(value) ? value : undefined
}

export function isArray(value: unknown): Array<unknown> | undefined {
  return guard.isArray(value) ? value : undefined
}

export function hasType(
  value: unknown,
): { type: string | string[] } | undefined {
  return guard.hasType(value) ? value : undefined
}

export function hasApType(
  value: unknown,
): { type: AnyType | TypeOrArrayWithType<AnyType> } | undefined {
  return guard.hasApType(value) ? value : undefined
}

export function isApEntity(value: unknown): Entity | undefined {
  return guard.isApEntity(value) ? value : undefined
}

export function isApActivity(value: unknown): Activity | undefined {
  return guard.isApActivity(value) ? value : undefined
}

export function isApCoreObject(value: unknown): CoreObject | undefined {
  return guard.isApCoreObject(value) ? value : undefined
}

export function isApExtendedObject(
  value: unknown,
): ExtendedObject | undefined {
  return guard.isApExtendedObject(value) ? value : undefined
}

export function isApActor(value: unknown): Actor | undefined {
  return guard.isApActor(value) ? value : undefined
}

export function isApCollection(
  value: unknown,
): EitherCollection | undefined {
  return guard.isApCollection(value) ? value : undefined
}

export function isApCollectionPage(
  value: unknown,
): EitherCollectionPage | undefined {
  return guard.isApCollectionPage(value) ? value : undefined
}

export function isApTransitiveActivity(
  value: unknown,
): TransitiveActivity<AnyTransitiveActivityType> | undefined {
  return guard.isApTransitiveActivity(value) ? value : undefined
}

export function isApType<T extends Entity>(
  value: unknown,
  type: string,
): T | undefined {
  return guard.isApType<T>(value, type) ? value : undefined
}

export function isApTypeOf<T extends Entity>(
  value: unknown,
  comparison: Record<string, string>,
): T | undefined {
  return guard.isApTypeOf<T>(value, comparison) ? value : undefined
}
