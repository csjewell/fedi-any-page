/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { CollectionReference, EitherCollectionReference, OrderedCollectionReference } from './Collection.ts'
import type { CoreObjectProperties } from './CoreObject.ts'
import type { BaseEntity } from './Entity.ts'
import type { StringReferenceMap } from './Utility.ts'

/**
 * An object containing all the types of Actors.
 *
 * @see {@link Actor}
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#actors
 */
export const ActorTypes = {
  APPLICATION  : 'Application',
  GROUP        : 'Group',
  ORGANIZATION : 'Organization',
  PERSON       : 'Person',
  SERVICE      : 'Service',
} as const

/**
 * A union of all Actor types.
 */
export type AnyActorType = (typeof ActorTypes)[keyof typeof ActorTypes]

/**
 * Properties common to all Actor types.
 *
 * @see https://www.w3.org/TR/activitypub/#actors
 *
 * @remarks The `manuallyApprovesFollowers` property is not included in the spec,
 * but it is included because it is common to all ActivityPub objects in
 * practice by way of an extension to the spec.
 */
export type ActorProperties = {
  inbox                 : OrderedCollectionReference
  outbox                : OrderedCollectionReference
  following?            : CollectionReference
  followers?            : CollectionReference
  liked?                : EitherCollectionReference
  preferredUsername?    : string
  preferredUsernameMap? : StringReferenceMap
  streams?              : Array<EitherCollectionReference>
  endpoints?            : {
    [key: string]               : URL | string | undefined
    proxyUrl?                   : URL
    oauthAuthorizationEndpoint? : string
    oauthTokenEndpoint?         : string
    provideClientKey?           : string
    signClientKey?              : string
    sharedInbox?                : URL
  }
  publicKey? : {
    id           : string
    owner        : string
    publicKeyPem : string
  }
  manuallyApprovesFollowers? : boolean
}

/**
 * The base type for all Actor entities.
 *
 * @extends BaseEntity
 *
 */
export type BaseActor<T extends AnyActorType>
  = & BaseEntity<T>
    & CoreObjectProperties
    & ActorProperties

/**
 * Per the ActivitySteams spec:
 *
 * > Describes a software application.
 *
 * @type Actor
 */
export type Application = BaseActor<typeof ActorTypes.APPLICATION>

/**
 * Per the ActivityStreams spec:
 *
 * > Represents a formal or informal collective of Actors.
 *
 * @type Actor
 */
export type Group = BaseActor<typeof ActorTypes.GROUP>

/**
 * Per the ActivityStreams spec:
 *
 * > Represents an organization.
 *
 * @type Actor
 */
export type Organization = BaseActor<typeof ActorTypes.ORGANIZATION>

/**
 * Per the ActivityStreams spec:
 *
 * > Represents an individual person.
 *
 * @type Actor
 */
export type Person = BaseActor<typeof ActorTypes.PERSON>

/**
 * Per the ActivityStreams spec:
 *
 * > Represents a service of any kind.
 *
 * @type Actor
 */
export type Service = BaseActor<typeof ActorTypes.SERVICE>

/**
 * Per the ActivityStreams Vocabulary spec:
 *
 * > An Entity that either performed or is expected to perform an Activity.
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#dfn-actor
 *
 * @extends CoreObject
 *
 */
export type Actor = Application | Service | Group | Organization | Person

/**
 * Either an Actor or a URL reference to an Actor.
 */
export type ActorReference = URL | Actor
