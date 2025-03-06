/* SPDX-License-Identifier: MIT */
import type { Application, Group, Organization, Person, Service } from './SpecificActors.ts'

/**
 * Per the ActivityStreams Vocabulary spec:
 *
 * > An Entity that either performed or is expected to perform an Activity.
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/#dfn-actor
 *
 * @extends CoreObject
 *
 * @instance Application
 * @instance Group
 * @instance Organization
 * @instance Person
 * @instance Service
 */
export type Actor = Application | Service | Group | Organization | Person

/**
 * Either an Actor or a URL reference to an Actor.
 */
export type ActorReference = URL | Actor
