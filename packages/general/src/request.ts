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

/**
 * The methods used to help handle requests that come in from federated sites.
 *
 * The constructor for a particular framework will take what THEY consider a
 * "request object" and store it so that these methods can be answered.
 */
export type Helper = {
  url             : URL;
  canAcceptHTML   : () => boolean;
  getFormInputs   : () => AP.OrPromise<AuthInputs>;
  getCookieInputs : () => AP.OrPromise<Cookies>;
}

/**
 * The method used to send an activity to a federated site.
 */
export type Sender<T> = {
  sendSignedRequest : (endpoint: URL, message: AP.Activity) => T;
}

/**
 * The methods used to handle saving activities that come in from federated sites.
 */
export type Router<_SessionT, ResponseT> = {
  create : (message: AP.Create) => Promise<ResponseT>;
  follow : (message: AP.Follow) => Promise<ResponseT>;
  undo   : (message: AP.Undo) => Promise<ResponseT>;
}
