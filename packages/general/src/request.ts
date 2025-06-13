/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'
import type * as AP from '@csjewell-activitypub/types'
import type { Cookies } from './cookies.ts'

/**
 * The schema for what inputs from authorization forms.
 *
 * @property username - The username provided by the user
 * @property password - The password provided by the user
 */
export const AuthInputsSchema = v.object({
  username : v.string(),
  password : v.string(),
})

/**
 * The inputs from authorization forms.
 *
 * @property username - The username provided by the user
 * @property password - The password provided by the user
 */
export type AuthInputs = v.InferOutput<typeof AuthInputsSchema>

export const ReplyActionBodySchema = v.object({
  identifier : v.string(),
  isUndo     : v.boolean(),
})

export type ReplyActionBody = v.InferOutput<typeof ReplyActionBodySchema>

export const ReplyActionInputsSchema = v.object({
  action     : v.picklist([ 'like', 'hide' ]),
  identifier : v.pipe(v.string(), v.url()),
  isUndo     : v.boolean(),
  // TODO: We need the actor's inbox here, if we can get it.
})

export type ReplyActionInputs = v.InferOutput<typeof ReplyActionInputsSchema>

export const ReplyInputsSchema = v.object({
  replyMarkDown : v.string(),
  replyTo       : v.string(),
  replyType     : v.pipe(v.number(), v.integer()),
})

export type ReplyInputs = v.InferOutput<typeof ReplyInputsSchema>

export const AnnounceInputsSchema = v.object({
  identifier : v.pipe(v.string(), v.url()),
  privacy    : v.picklist([ 'public', 'followers' ]),
  // TODO: We need the actor's inbox here, if we can get it.
})

export type AnnounceInputs = v.InferOutput<typeof AnnounceInputsSchema>


/**
 * The methods used to help handle requests that come in from federated sites.
 *
 * The constructor for a particular framework will take what THEY consider a
 * "request object" and store it so that these methods can be answered.
 */
export type Helper = {
  url                  : URL
  canAcceptHTML        : () => boolean
  getFormInputs        : () => AP.OrPromise<AuthInputs>
  getCookieInputs      : () => AP.OrPromise<Cookies>
  getReplyActionInputs : () => AP.OrPromise<ReplyActionInputs>
  getReplyInputs       : () => AP.OrPromise<ReplyInputs>
  getAnnounceInputs    : () => AP.OrPromise<AnnounceInputs>
}

/**
 * The methods used to handle saving activities that come in from federated sites.
 */
export type Router<_SessionT, ResponseT> = {
  create : (message: AP.Create) => Promise<ResponseT>;
  follow : (message: AP.Follow) => Promise<ResponseT>;
  undo   : (message: AP.Undo) => Promise<ResponseT>;
}
