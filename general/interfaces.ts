/* SPDX-License-Identifier: MIT */
import type { AP } from 'activitypub-core-types'
import type { CoreObject, EntityReference } from 'activitypub-core-types/lib/activitypub/index.js'

/*
 */
export interface Responses {
  getHeaders(cors?: boolean): Record<string, string>
  success202(info?: string): unknown
  success204(info?: string): unknown
  options204(methods?: Array<string>, allowHeaders?: Array<string>): unknown
  error404(info?: string): unknown
  error404NotImplemented(): unknown
  error405(info?: string): unknown
  error422(info?: string): unknown
  error500(info?: string): unknown
}

/*
 */
export interface RequestHandler {
  handle(): any
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
  remove(): boolean
  save(...arguments_: Array<any>): boolean
  exists(): boolean
  retrieve(): any
}

/*
 */
export interface DatabaseRouter {
  handle(): any
  announce(message: AP.Announce): Database
  follow(message: AP.Follow): Database
  like(message: AP.Like): Database
  note(message: AP.Note): Database
  actor(message: AP.ActorReference): Database
  getDocument(dr: string | EntityReference | Array<EntityReference> | URL | undefined): CoreObject | undefined
}

/*
 */
export interface Configuration {
  url(): URL
  privateKey(): string
  database(): unknown
}
