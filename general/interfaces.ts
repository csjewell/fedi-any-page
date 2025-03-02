/* SPDX-License-Identifier: MIT */
import type * as AP from '@csjewell-activitypub/types'

export type OrArray<T> = T | Array<T>

export type DBDocument = {
  object: AP.CoreObject | undefined
  objectId: number | undefined
}

export type DBUsername = {
  username: string | undefined
  usernameId: number | undefined
}

/*
 */
export interface Responses {
  getHeaders(cors?: boolean): Record<string, string>
  success200(object: AP.CoreObject): unknown
  success202(info?: string): unknown
  success204(info?: string): unknown
  options204(methods?: Array<string>, allowHeaders?: Array<string>): unknown
  redirect30x(url: string, statusCode: 301 | 302 | 303 | 307 | 308): unknown
  error404(info?: string): unknown
  error404NotImplemented(): unknown
  error405(info?: string): unknown
  error422(info?: string): unknown
  error500(info?: string): unknown
}

/*
 */
export interface RequestHelper {
  canAcceptHTML(): boolean
}

/*
 */
export interface RequestHandler {
  handle(): unknown
}

/*
 */
export interface Sender {
  sendSignedRequest(endpoint: URL, message: AP.Activity): Response
}

/*
 */
export interface RequestRouter {
  create(message: AP.Create): RequestHandler
  follow(message: AP.Follow): RequestHandler
  undo(message: AP.Undo): RequestHandler
}

/*
 */
export interface Database {
  databaseId(): number | undefined
  document(): unknown
  remove(): Promise<boolean>
  save(...arguments_: Array<unknown>): Promise<boolean>
  exists(): Promise<boolean>
  retrieve(): Promise<unknown>
  shorten(): Promise<{ url: URL | undefined; id: number | undefined }>
}

/*
 */
export interface DatabaseKey {
  createKey(): Promise<void>
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

/*
 */
export interface Configuration {
  url: URL
  privateKey: string
  database: unknown
  username: string
  debugDB?: boolean

  localGet(url: string | URL): AP.CoreObject | undefined
  getActorURL(username: string): string
  getActorBasedId(username: string, ending: string): string
}
