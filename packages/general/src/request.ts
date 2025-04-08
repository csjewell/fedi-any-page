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

/**
 * The methods used to help handle requests that come in from federated sites.
 */

/**
 * Shorthand for a value of a given type or array of values that all conform
 * to that type.
 *
 * This is useful internally to represent many ActivityPub properties.
 *
 * @param T The type of the value to be mapped.
 *
 * @example
 * ```ts
 * // A string or array of strings.
 * type StringOrArrayOfStrings = OrArray<string>;
 *
 * const a: StringOrArrayOfStrings = 'foo';
 * const b: StringOrArrayOfStrings = ['foo', 'bar'];
 * ```
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
/**
 * Shorthand for a value of a given type or array of values that all conform
 * to that type.
 *
 * This is useful internally to represent many ActivityPub properties.
 *
 * @param T The type of the value to be mapped.
 *
 * @example
 * ```ts
 * // A string or array of strings.
 * type StringOrArrayOfStrings = OrArray<string>;
 *
 * const a: StringOrArrayOfStrings = 'foo';
 * const b: StringOrArrayOfStrings = ['foo', 'bar'];
 * ```
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
