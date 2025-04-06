/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'

type SessionInputs = {
  actor         : string;
  sessionCookie : unknown;
}

type AuthInputs = {
  username : string;
  password : string;
}

/*
 */
export type Helper = {
  url             : URL;
  canAcceptHTML   : () => boolean;
  getFormInputs   : () => AuthInputs;
  getCookieInputs : () => SessionInputs;
}

/*
 */
export type Sender<T> = {
  sendSignedRequest : (endpoint: URL, message: AP.Activity) => T;
}

/*
 */
export type Router<_SessionT, ResponseT> = {
  create : (message: AP.Create) => Promise<ResponseT>;
  follow : (message: AP.Follow) => Promise<ResponseT>;
  undo   : (message: AP.Undo) => Promise<ResponseT>;
}
