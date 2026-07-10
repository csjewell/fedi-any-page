/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Activity } from './Activity.ts'
import type { Actor } from './Actor.ts'
import type { AnyCollectionOrCollectionPage } from './Collection.ts'
import type { ExtendedObject } from './ExtendedObject.ts'
import type { Link, Mention } from './Link.ts'

/**
 * The base type for all ActivityPub Object Types, including Actors, Activities,
 * Collections, and Extended Objects.
 *
 * @remarks This type is named `CoreObject` instead of `Object` to avoid collision
 * with the JavaScript `Object` type. Further, this avoids confusion with what
 * the spec refers to as "Objects", which are called "Entities" in this library.
 *
 * @see https://www.w3.org/TR/activitystreams-core/#object
 *
 * @extends Entity
 *
 * @see {@link ExtendedObject}
 * @see {@link Actor}
 * @see {@link Activity}
 * @see {@link Collection}
 */
export type CoreObject
  = | ExtendedObject
    | Actor
    | Activity
    | AnyCollectionOrCollectionPage

/**
 * Either a CoreObject or a URL reference to a CoreObject.
 */
export type CoreObjectReference = URL | CoreObject

/**
 * The base type for all ActivityPub objects, including Core Object and Link
 * types.
 *
 * @remarks The spec does not specify a base type, but this library does for
 * convenience and easier type checking. Instead, the spec refers to all
 * ActivityPub documents as "Objects". This library uses the term "Entity" to
 * refer to all ActivityPub documents, including both Core Objects and Links.
 *
 * The spec allows the type property to be optional, but it is required by
 * this library in order to differentiate between different types of objects.
 *
 * @see {@link CoreObject}
 * @see {@link Link}
 */
export type Entity = CoreObject | Link | Mention

/**
 * Either an Entity or a URL reference to an Entity.
 */
export type EntityReference = URL | Entity
