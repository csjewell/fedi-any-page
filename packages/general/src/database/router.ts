/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type {
  ActorReference, Announce, CoreObject, CoreObjectReference, EntityReference,
  Follow, Like, LinkReference, Note, OrArray,
} from '@csjewell-activitypub/types'
import type { Database } from './handler.ts'
import type { Session } from './session.ts'
import type { UsersDB } from './users.ts'

type OrPromise<T> = T | Promise<T>

export type DBDocument = {
  object   : CoreObject | undefined
  objectId : number | undefined
}

type ActorFunc = (username: string) => string

/*
 */
export type DatabaseRouter<DatabaseT, TableT, SessionT> = {
  dbHandle      : () => DatabaseT
  announce      : (message: Announce) => Database<TableT>
  follow        : (message: Follow) => Database<TableT>
  like          : (message: Like) => Database<TableT>
  note          : (message: Note) => Database<TableT>
  actor         : (message: ActorReference) => Database<TableT>
  documentEntry : (message: CoreObjectReference | LinkReference) => Database<TableT>
  getDocument   : (dr: string | OrArray<EntityReference> | undefined) => DBDocument
  users         : (username: string) => Database<TableT> & UsersDB
  newSession    : (username: string, actorFunc: ActorFunc) => OrPromise<Database<TableT> & Session<SessionT>>
  session       : (username: string, sessionKey: string) => OrPromise<Database<TableT> & Session<SessionT>>
}
