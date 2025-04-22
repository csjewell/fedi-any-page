/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'

/**
 * The inputs from the session cookie.
 */
export type SessionInputs = {
  /** The "actor URL" of the current user. */
  actor         : string;
  /** TODOCUMENT */
  sessionCookie : unknown;
}

/**
 * The inputs from authorization forms.
 *
 * @expand
 */
export type AuthInputs = {
  /** The username provided by the user */
  username : string;
  /** The password provided by the user */
  password : string;
}

/**
 * The methods used to help handle requests that come in from federated sites.
 *
 * The constructor for a particular framework will take what THEY consider a
 * "request object" and store it so that these methods can be answered.
 */
export type Helper = {
  url             : URL;
  canAcceptHTML   : () => boolean;
  getFormInputs   : () => AuthInputs;
  getCookieInputs : () => SessionInputs;
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
