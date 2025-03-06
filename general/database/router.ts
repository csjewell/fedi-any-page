/* SPDX-License-Identifier: MIT */
import type * as AP from '@csjewell-activitypub/types'
import type { Database } from './handler.ts'

type OrArray<T> = T | Array<T>

export type DBDocument = {
  object: AP.CoreObject | undefined
  objectId: number | undefined
}

/*
 */
export interface DatabaseRouter {
  dbHandle(): unknown
  announce(message: AP.Announce): Database
  follow(message: AP.Follow): Database
  like(message: AP.Like): Database
  note(message: AP.Note): Database
  actor(message: AP.ActorReference): Database
  documentEntry(message: AP.CoreObjectReference | AP.LinkReference): Database
  getDocument(dr: string | OrArray<AP.EntityReference> | undefined): DBDocument
}
