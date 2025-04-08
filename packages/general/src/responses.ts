/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

type HeadersParam = { cors?: boolean; addHeaders?: Record<string, string> }

type BasicResponseParam = { info?: string; addHeaders?: Record<string, string> }

type ResponseParam200Obj<SessionT> = {
  body        : Record<string, unknown>;
  addHeaders? : Record<string, string>
  cookies?    : SessionT,
}

type ResponseParam200Str<SessionT> = {
  body        : string;
  addHeaders? : Record<string, string>
  cookies?    : SessionT
}

type ResponseParam204 = { info?: string }

type ResponseParam204Options = {
  addHeaders?   : Record<string, string>
  methods?      : Array<string>
  allowHeaders? : Array<string>
}

type ResponseParam30x = { url: string; statusCode?: 301 | 302 | 303 | 307 | 308 }

type ResponseParam404 = { info?: string; additional?: string; addHeaders?: Record<string, string> }

type ResponseParam405 = { info?: string; addMethods?: Array<string>; addHeaders?: Record<string, string> }

/** The group of responses that are sent upon web requests */
export type Responses<SessionT, T> = {
  getHeaders             : (arg0?: HeadersParam) => Record<string, string>
  success200Obj          : (arg0: ResponseParam200Obj<SessionT>) => T
  success200Str          : (arg0: ResponseParam200Str<SessionT>) => T
  success202             : (arg0?: BasicResponseParam) => T
  success204             : (arg0?: ResponseParam204) => T
  options204             : (arg0?: ResponseParam204Options) => T
  redirect30x            : (arg0: ResponseParam30x) => T
  error403               : (arg0?: BasicResponseParam) => T
  error404               : (arg0?: ResponseParam404) => T
  error404NotImplemented : () => T
  error405               : (arg0?: ResponseParam405) => T
  error422               : (arg0?: BasicResponseParam) => T
  error500               : (arg0?: BasicResponseParam) => T
  error503               : (arg0?: BasicResponseParam) => T
}
