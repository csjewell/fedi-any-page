/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { ActivityTypes } from './Activity.ts'
import { ActorTypes } from './Actor.ts'
import {
  CollectionPageTypes, type CollectionReference, CollectionTypes,
  type OrderedCollectionReference,
} from './Collection.ts'
import { ExtendedObjectTypes, type ImageReference } from './ExtendedObject.ts'
import type { EntityReference } from './CoreUtility.ts'
import type { LinkReference } from './Link.ts'
import type { OrArray, StringReferenceMap } from './Utility.ts'


/**
 * An object containing all the types of CoreObjects.
 *
 * @see {@link CoreObject}
 *
 * @see https://www.w3.org/TR/activitystreams-core/#object
 */
export const CoreObjectTypes = {
  ...ExtendedObjectTypes,
  ...ActorTypes,
  ...ActivityTypes,
  ...CollectionTypes,
  ...CollectionPageTypes,
} as const

/**
 * A union of all Core Object types.
 */
export type AnyCoreObjectType = (typeof CoreObjectTypes)[keyof typeof CoreObjectTypes]

/**
 * Properties common to all Core Objects.
 *
 * @see https://www.w3.org/TR/activitystreams-core/#object
 *
 * @remarks The `sensitive` property is not included in the spec, but it is
 * included because it is common to all ActivityPub objects in practice
 * by way of an extension to the spec.
 */
export type CoreObjectProperties = {
  // Activity Streams properties.
  attachment?   : OrArray<EntityReference>
  attributedTo? : OrArray<EntityReference>
  audience?     : OrArray<EntityReference>
  bcc?          : OrArray<EntityReference>
  bto?          : OrArray<EntityReference>
  cc?           : OrArray<EntityReference>
  content?      : string
  contentMap?   : StringReferenceMap
  context?      : OrArray<EntityReference>
  duration?     : string
  endTime?      : Date
  generator?    : OrArray<EntityReference>
  icon?         : OrArray<ImageReference | LinkReference>
  image?        : OrArray<ImageReference | LinkReference>
  inReplyTo?    : OrArray<EntityReference>
  location?     : OrArray<EntityReference>
  mediaType?    : string
  name?         : string
  nameMap?      : StringReferenceMap
  preview?      : OrArray<EntityReference>
  published?    : Date
  replies?      : CollectionReference
  startTime?    : Date
  summary?      : string
  summaryMap?   : StringReferenceMap
  tag?          : OrArray<EntityReference>
  to?           : OrArray<EntityReference>
  updated?      : Date
  url?          : OrArray<LinkReference>

  // ActivityPub
  likes?  : OrderedCollectionReference
  shares? : OrderedCollectionReference
  source?: {
    content?    : string
    contentMap? : StringReferenceMap
  }

  // Extension
  sensitive? : boolean
}
