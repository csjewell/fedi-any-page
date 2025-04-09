/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type {
  Actor, ActorReference, Announce, CoreObject, CoreObjectReference, EntityReference,
  Follow, Like, Link, LinkReference, Note, OrArray, OrPromise,
} from '@csjewell-activitypub/types'
import type { User } from '../users.ts'
import type { SessionStorage } from './session.ts'
import type { UsersStorage } from './users.ts'

/**
 * The methods that operate on storage of individual types
 *
 * @param T The type of information returned from the storage
 */
export type StorageHandler<T> = {
  databaseId : () => number | undefined
  document   : () => T | undefined
  remove     : () => Promise<boolean>
  save       : (...arguments_: Array<unknown>) => Promise<boolean>
  exists     : () => Promise<boolean>
  retrieve   : (...arguments_: Array<unknown>) => Promise<T>
  shorten    : () => Promise<{ url: URL | undefined; id: number | undefined }>
}

/** TODO: Document [2025-04-12] */
export type DBDocument = {
  object   : CoreObject | undefined
  objectId : number | undefined
}

/** A function that gets an actor identifier from a username */
export type ActorFunc = (username: string) => string

/**
 * The methods that act on a database as a whole.
 *
 * @param DatabaseT The type of the database handle itself.
 * @param TableT (TODOCUMENT)
 * @param SessionT The type of the session information
 */
export type Router<DatabaseT, SessionReturnT> = {
  /** Returns the handle to the database itself */
  dbHandle      : () => DatabaseT
  /** Returns the handler for the database table that srores references to Announce objects */
  announce      : (message: Announce) => StorageHandler<Announce>
  /** Returns the handler for the database table that srores references to Follow objects */
  follow        : (message: Follow) => StorageHandler<Follow>
  /** Returns the handler for the database table that stores references to Like objects */
  like          : (message: Like) => StorageHandler<Like>
  /** Returns the handler for the database table that stores references to Note objects */
  note          : (message: Note) => StorageHandler<Note>
  /** Returns the handler for the database table that stores references to Actor objects */
  actor         : (message: ActorReference) => StorageHandler<Actor>
  /** Returns the handler for the database table that stores ActivityPub objects */
  documentEntry : (message: CoreObjectReference | LinkReference) => StorageHandler<CoreObject | Link>
  /** Returns an ActivityPub document and its numeric id */
  getDocument   : (dr: string | OrArray<EntityReference> | undefined) => DBDocument
  /** Returns the handler for the database table that stores user information. */
  users         : () => StorageHandler<User> & UsersStorage
  /** Returns a handler for the "session" table when we have no session established */
  newSession    : (username: string, actorFunc: ActorFunc) => OrPromise<SessionStorage<SessionReturnT>>
  /** Returns a handler for the "session" table when we have a session established already */
  session       : (username: string, sessionKey: string) => OrPromise<SessionStorage<SessionReturnT>>
}
