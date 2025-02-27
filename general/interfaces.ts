/* SPDX-License-Identifier: MIT */
import type { AP } from 'activitypub-core-types'

export type DBDocument = {
  object: AP.CoreObject | undefined
  objectId: number | undefined
}

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
  remove(): boolean
  save(...arguments_: Array<unknown>): boolean
  exists(): boolean
  retrieve(): unknown
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
  getDocument(dr: string | AP.EntityReference | Array<AP.EntityReference> | URL | undefined): DBDocument
}

/*
 */
export interface Configuration {
  url: URL
  privateKey: string
  database: unknown
  username: string
  getActorURL(username: string): string
  getActorBasedId(username: string, ending: string): string
}
