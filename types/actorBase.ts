/* SPDX-License-Identifier: MIT */
import type { BaseEntity } from './Entity.ts'
import type { CoreObjectProperties } from './CoreObject.ts'
import type { CollectionReference, EitherCollectionReference, OrderedCollectionReference } from './Collection.ts'
import type { StringReferenceMap } from './Utility.ts'
import type { ActorTypes } from './ActorList.ts'

/**
 * A union of all Actor types.
 */
export type AnyActorType = (typeof ActorTypes)[keyof typeof ActorTypes]

/**
 * Properties common to all Actor types.
 *
 * @see https://www.w3.org/TR/activitypub/#actors
 *
 * @note The `manuallyApprovesFollowers` property is not included in the spec,
 * but it is included because it is common to all ActivityPub objects in
 * practice by way of an extension to the spec.
 */
export type ActorProperties = {
  inbox: OrderedCollectionReference
  outbox: OrderedCollectionReference
  following?: CollectionReference
  followers?: CollectionReference
  liked?: EitherCollectionReference
  preferredUsername?: string
  preferredUsernameMap?: StringReferenceMap
  streams?: EitherCollectionReference[]
  endpoints?: {
    [key: string]: URL | string | undefined
    proxyUrl?: URL
    oauthAuthorizationEndpoint?: string
    oauthTokenEndpoint?: string
    provideClientKey?: string
    signClientKey?: string
    sharedInbox?: URL
  }
  publicKey?: {
    id: string
    owner: string
    publicKeyPem: string
  }
  manuallyApprovesFollowers?: boolean
}

/**
 * The base type for all Actor entities.
 *
 * @extends BaseEntity
 *
 * @instance Application
 * @instance Group
 * @instance Organization
 * @instance Person
 * @instance Service
 */
export type BaseActor<T extends AnyActorType> =
  & BaseEntity<T>
  & CoreObjectProperties
  & ActorProperties
