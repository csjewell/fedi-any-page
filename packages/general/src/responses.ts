/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

type ResolvedHeader = [string, string,]
type ResolvedHeadersType = Array<ResolvedHeader>
type HeadersType = ResolvedHeadersType | Record<string, string>

type HeadersParam = { cors?: boolean; addHeaders?: ResolvedHeadersType }

type BasicResponseParam = { info?: string; addHeaders?: HeadersType }

type ResponseParam200Obj<SessionT> = {
  /** The body of the response as an object to be JSON-stringified. */
  body        : Record<string, unknown>
  /** Additional headers to be sent with the response. */
  addHeaders? : HeadersType
  /** Cookies to be sent with the response. */
  cookies?    : SessionT,
}

type ResponseParam200Str<SessionT> = {
  /** The body of the response as a string. */
  body        : string;
  /** Additional headers to be sent with the response. */
  addHeaders? : HeadersType
  /** Cookies to be sent with the response. */
  cookies?    : SessionT
}

type ResponseParam204 = {
  /** Information about why there is no body to the response. */
  info? : string
}

type ResponseParam204Options = {
  addHeaders?   : HeadersType
  methods?      : Array<string>
  allowHeaders? : Array<string>
}

type ResponseParam30x = {
  /** The URL to redirect to */
  url         : string;
  /** The type of redirection to do */
  statusCode? : 301 | 302 | 303 | 307 | 308
}

type ResponseParam404 = { info?: string; additional?: string; addHeaders?: HeadersType }

/**
 * The parameters that could be given to... TODO
 *
 * @public
 */
type ResponseParam405 = {
  info?       : string;
  addMethods? : Array<string>;
  addHeaders? : HeadersType
}

/**
 * The group of responses that are sent as replies to web requests.
 *
 * @param SessionT - The variables stored within the local session storage for the user.
 * @param ResponseT - The type of response to be sent back to the web server
 */
export type Responses<SessionT, ResponseT> = {
  getHeaders             : (argHash?: HeadersParam) => ResolvedHeadersType
  /** Respond with a 200 success message based on a JSON-stringifiable object */
  success200Obj          : (argHash: ResponseParam200Obj<SessionT>) => ResponseT
  /** Respond with a 200 success message based on a (text) message */
  success200Str          : (argHash: ResponseParam200Str<SessionT>) => ResponseT
  /** */
  success202             : (argHash?: BasicResponseParam) => ResponseT
  success204             : (argHash?: ResponseParam204) => ResponseT
  /** Returns the response for the OPTIONS request. */
  options204             : (argHash?: ResponseParam204Options) => ResponseT
  /** Response used when a redirection is needed */
  redirect30x            : (argHash: ResponseParam30x) => ResponseT
  error403               : (argHash?: BasicResponseParam) => ResponseT
  /** Response used when something was not found */
  error404               : (argHash?: ResponseParam404) => ResponseT
  /** Response used when something was not implemented yet */
  error404NotImplemented : () => ResponseT
  error405               : (argHash?: ResponseParam405) => ResponseT
  error422               : (argHash?: BasicResponseParam) => ResponseT
  /** Response returned when the server encountered an internal error */
  error500               : (argHash?: BasicResponseParam) => ResponseT
  /** Response returned when the service is not available */
  error503               : (argHash?: BasicResponseParam) => ResponseT
}
