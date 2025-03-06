/* SPDX-License-Identifier: MIT */

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
