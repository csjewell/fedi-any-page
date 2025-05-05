/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'
import type { User } from '../users.ts'
import type { SessionDB } from './session.ts'
import type { UsersStorage } from './users.ts'

/**
 * The methods that operate on storage of individual types
 *
 * @typeParam T The type of information returned from the storage
 */
export type StorageHandler<T> = {
  databaseId : () => number | undefined
  document   : () => T | undefined
  remove     : () => Promise<boolean>
  save       : (...arguments_: Array<unknown>) => Promise<boolean>
  exists     : () => Promise<boolean>
  retrieve   : (...arguments_: Array<unknown>) => Promise<T | undefined>
  shorten    : () => Promise<{ url: URL | undefined; id: number | undefined }>
}

/** TODO: Document [2025-04-12] */
export type DBDocument = {
  object   : AP.CoreObject | undefined
  objectId : number | undefined
}

/** A function that gets an actor identifier from a username */
export type ActorFunc = (username: string) => string

/**
 * The methods that act on a database as a whole.
 *
 * It is mandatory that implementations of this type extend @link{SessionRouter}
 * to implement newSession and session
 *
 * @typeParam DatabaseT The type of the database handle itself.
 *
 */
export type Router<DatabaseT> = {
  /** Returns the handle to the database itself */
  dbHandle      : () => DatabaseT
  /** Returns the handler for the database table that srores references to Announce objects */
  announce      : (message: AP.Announce) => StorageHandler<AP.Announce>
  /** Returns the handler for the database table that srores references to Follow objects */
  follow        : (message: AP.Follow) => StorageHandler<AP.Follow>
  /** Returns the handler for the database table that stores references to Like objects */
  like          : (message: AP.Like) => StorageHandler<AP.Like>
  /** Returns the handler for the database table that stores references to Note objects */
  note          : (message: AP.Note) => StorageHandler<AP.Note>
  /** Returns the handler for the database table that stores references to Actor objects */
  actor         : (message: AP.ActorReference) => StorageHandler<AP.Actor>
  /** Returns the handler for the database table that stores ActivityPub objects */
  documentEntry : (message: AP.CoreObjectReference | AP.LinkReference) => StorageHandler<AP.CoreObject | AP.Link>
  /** Returns an ActivityPub document and its numeric id */
  getDocument   : (dr: string | AP.OrArray<AP.EntityReference> | undefined) => DBDocument
  /** Returns the handler for the database table that stores user information. */
  users         : () => StorageHandler<User> & UsersStorage
  /** Returns a handler for the "session" table when we have no session established */
  newSession    : (username: string, actorFunc: ActorFunc) => Promise<SessionDB>
  /** Returns a handler for the "session" table when we have a session established already */
  session       : (username: string, sessionKey: string) => Promise<SessionDB>
  /** Store a generated CoreObject to be sent out later. */
  sendToOutbox  : (usernameId: number, actor: string, message: AP.CoreObject) => AP.OrPromise<boolean>
}
