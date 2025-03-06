/* SPDX-License-Identifier: MIT */
import type { BaseActor } from './actorBase.ts'
import type { ActorTypes } from './ActorList.ts'

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
