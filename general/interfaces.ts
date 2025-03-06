/* SPDX-License-Identifier: MIT */
import type * as AP from '@csjewell-activitypub/types'

export type OrArray<T> = T | Array<T>

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
