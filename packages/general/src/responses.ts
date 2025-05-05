/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { OrPromise } from '@csjewell-activitypub/types'
import type { Cookies } from './cookies.ts'

export type ResolvedHeader = [string, string,]
export type ResolvedHeaders = Array<ResolvedHeader>
export type HeadersType = ResolvedHeaders | Record<string, string>

type HeadersParam = { cors?: boolean; addHeaders?: ResolvedHeaders }

/**
 * The group of responses that are sent as replies to web requests.
 *
 * @typeParam ResponseT - The type of the response object to be sent back to the web server
 */
export type Type<ResponseT> = {
  getHeaders    : (argHash?: HeadersParam) => ResolvedHeaders
  handleCookies : (cookies: Cookies) => ResolvedHeaders

  /**
   * Respond with a (200) success message based on a JSON-stringifiable object
   * @param argHash.body - The body of the response as an object to be JSON-stringified.
   * @param argHash.addHeaders - Additional headers to be sent with the response.
   * @param argHash.cookies - Information to be set in cookies to be sent with the response.
   */
  success200Obj: (argHash: {
    body        : Record<string, unknown>
    addHeaders? : HeadersType
    cookies?    : Cookies,
  }) => OrPromise<ResponseT>

  /**
   * Respond with a (200) success message based on a (text) message
   * @param argHash.body - The body of the response as a string.
   * @param argHash.addHeaders - Additional headers to be sent with the response.
   * @param argHash.cookies - Information to be set in cookies to be sent with the response.
   */
  success200Str: (argHash: {
    body        : string;
    addHeaders? : HeadersType
    cookies?    : Cookies
  }) => OrPromise<ResponseT>

  /**
   * TODOCUMENT
   * @param argHash.addHeaders - Additional headers to be sent with the response.
   */
  success202: (argHash?: {
    info?       : string;
    addHeaders? : HeadersType
  }) => ResponseT

  /**
   * @param argHash.info - Information about why there is no body to the response.
   */
  success204: (argHash?: {
    info? : string
  }) => ResponseT

  /** Returns the response for the OPTIONS request. */
  options204: (argHash?: {
    /** Additional headers to be sent with the response. */
    addHeaders?   : HeadersType
    /** Methods allowed to be called on a "cross-origin" basis. */
    methods?      : Array<string>
    /** Additional headers to be allowed to be sent from other responses. */
    allowHeaders? : Array<string>
  }) => ResponseT

  /**
   * Response used when a redirection is needed
   * @param argHash.url - The URL to redirect to
   * @param argHash.statusCode - The type of redirection to do
   */
  redirect30x: (argHash: {
    url         : string;
    statusCode? : 301 | 302 | 303 | 307 | 308
  }) => ResponseT

  /** */
  error403: (argHash?: {
    info?       : string;
    addHeaders? : HeadersType
  }) => ResponseT

  /** Response used when something was not found */
  error404: (argHash?: {
    info?       : string;
    additional? : string;
    addHeaders? : HeadersType
  }) => ResponseT

  /** Response used when something was not implemented yet */
  error404NotImplemented : () => ResponseT

  /**
   * Response used when a method was not allowed.
   * @param argHash.info - Description of why this method was not allowed.
   * @param argHash.addMethods - Methods that are allowed to be called on this URL instead.
   * @param argHash.addHeaders - Additional headers to be sent with the response.
   * @returns A response object
   */
  error405: (argHash?: {
    info?       : string;
    addMethods? : Array<string>;
    addHeaders? : HeadersType
  }) => ResponseT

  error422: (argHash?: {
    info?       : string;
    addHeaders? : HeadersType
  }) => ResponseT

  /** Response returned when the server encountered an internal error */
  error500: (argHash?: {
    info?       : string;
    addHeaders? : HeadersType
  }) => ResponseT

  /** Response returned when the service is not available */
  error503: (argHash?: {
    info?       : string;
    addHeaders? : HeadersType
  }) => ResponseT
}
