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
type HeadersParam = { cors?: boolean; addHeaders?: Record<string, string> }
type BasicResponseParam = { info?: string; addHeaders?: Record<string, string> }
type ResponseParam200Obj = { body: Record<string, unknown>; addHeaders?: Record<string, string> }
type ResponseParam200Str = { body: string; addHeaders?: Record<string, string> }
type ResponseParam204 = { info?: string }
type ResponseParam204Options = {
  addHeaders?: Record<string, string>
  methods?: Array<string>
  allowHeaders?: Array<string>
}
type ResponseParam30x = { url: string; statusCode?: 301 | 302 | 303 | 307 | 308 }
type ResponseParam404 = { info?: string; additional?: string; addHeaders?: Record<string, string> }
type ResponseParam405 = { info?: string; addMethods?: Array<string>; addHeaders?: Record<string, string> }
export interface Responses {
  getHeaders(arg0?: HeadersParam): Record<string, string>
  success200Obj(arg0: ResponseParam200Obj): unknown
  success200Str(arg0: ResponseParam200Str): unknown
  success202(arg0?: BasicResponseParam): unknown
  success204(arg0?: ResponseParam204): unknown
  options204(arg0?: ResponseParam204Options): unknown
  redirect30x(arg0: ResponseParam30x): unknown
  error404(arg0?: ResponseParam404): unknown
  error404NotImplemented(): unknown
  error405(arg0?: ResponseParam405): unknown
  error422(arg0?: BasicResponseParam): unknown
  error500(arg0?: BasicResponseParam): unknown
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
  siteName: string

  localGet(url: string | URL): AP.CoreObject | undefined
  getActorURL(username: string): string
  getActorBasedId(username: string, ending: string): string
}
