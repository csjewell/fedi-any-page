/* SPDX-License-Identifier: MIT */
/**
 * An object containing all the types of ExtendedObjects.
 *
 * @see ExtendedObject
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#extendedtypes
 */
export const ExtendedObjectTypes = {
  ARTICLE: 'Article',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  EVENT: 'Event',
  IMAGE: 'Image',
  NOTE: 'Note',
  PAGE: 'Page',
  PLACE: 'Place',
  PROFILE: 'Profile',
  RELATIONSHIP: 'Relationship',
  TOMBSTONE: 'Tombstone',
  VIDEO: 'Video',
  HASHTAG: 'Hashtag', // Extension
} as const

/**
 * An object containing all the types of Links.
 *
 * @see Link
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#links
 */
export const LinkTypes = {
  LINK: 'Link',
  MENTION: 'Mention',
} as const

/**
 * An object containing all the types of Actors.
 *
 * @see Actor
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#actors
 */
export const ActorTypes = {
  APPLICATION: 'Application',
  GROUP: 'Group',
  ORGANIZATION: 'Organization',
  PERSON: 'Person',
  SERVICE: 'Service',
} as const

/**
 * An object containing all the types of Transitive Activities.
 *
 * @see TransitiveActivity
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#transitive-activity-types
 */
export const TransitiveActivityTypes = {
  ACCEPT: 'Accept',
  ADD: 'Add',
  ANNOUNCE: 'Announce',
  BLOCK: 'Block',
  IGNORE: 'Ignore',
  CREATE: 'Create',
  DELETE: 'Delete',
  DISLIKE: 'Dislike',
  FLAG: 'Flag',
  FOLLOW: 'Follow',
  INVITE: 'Invite',
  JOIN: 'Join',
  LEAVE: 'Leave',
  LIKE: 'Like',
  LISTEN: 'Listen',
  MOVE: 'Move',
  OFFER: 'Offer',
  READ: 'Read',
  REJECT: 'Reject',
  REMOVE: 'Remove',
  TENTATIVE_ACCEPT: 'TentativeAccept',
  TENTATIVE_REJECT: 'TentativeReject',
  UNDO: 'Undo',
  UPDATE: 'Update',
  VIEW: 'View',
} as const

/**
 * An object containing all the types of Intransitive Activities.
 *
 * @see IntransitiveActivity
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#intransitive-activity-types
 */
export const IntransitiveActivityTypes = {
  ARRIVE: 'Arrive',
  TRAVEL: 'Travel',
  QUESTION: 'Question',
} as const

/**
 * An object containing all the types of Activities.
 *
 * @see Activity
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#activity-types
 */
export const ActivityTypes = {
  ...TransitiveActivityTypes,
  ...IntransitiveActivityTypes,
} as const

/**
 * An object containing all the types of Collections.
 *
 * @see Collection
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collection
 */
export const CollectionTypes = {
  COLLECTION: 'Collection',
  ORDERED_COLLECTION: 'OrderedCollection',
} as const

/**
 * An object containing all the types of CollectionPages.
 *
 * @see CollectionPage
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#dfn-collectionpage
 */
export const CollectionPageTypes = {
  COLLECTION_PAGE: 'CollectionPage',
  ORDERED_COLLECTION_PAGE: 'OrderedCollectionPage',
} as const

/**
 * An object containing all the types of CoreObjects.
 *
 * @see CoreObject
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
