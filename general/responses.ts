/* SPDX-License-Identifier: MIT */

/*
 */
type HeadersParam = { cors?: boolean; addHeaders?: Record<string, string> }

type BasicResponseParam = { info?: string; addHeaders?: Record<string, string> }

type ResponseParam200Obj = { body: Record<string, unknown>; addHeaders?: Record<string, string> }

type ResponseParam200Str = { body: string; addHeaders?: Record<string, string> }

type ResponseParam204 = { info?: string }

type ResponseParam204Options = {
  addHeaders?: Record<string, string>
  methods?: Array<string>
  allowHeaders?: Array<string>
}

type ResponseParam30x = { url: string; statusCode?: 301 | 302 | 303 | 307 | 308 }

type ResponseParam404 = { info?: string; additional?: string; addHeaders?: Record<string, string> }

type ResponseParam405 = { info?: string; addMethods?: Array<string>; addHeaders?: Record<string, string> }

export default interface Responses {
  getHeaders(arg0?: HeadersParam): Record<string, string>
  success200Obj(arg0: ResponseParam200Obj): unknown
  success200Str(arg0: ResponseParam200Str): unknown
  success202(arg0?: BasicResponseParam): unknown
  success204(arg0?: ResponseParam204): unknown
  options204(arg0?: ResponseParam204Options): unknown
  redirect30x(arg0: ResponseParam30x): unknown
  error404(arg0?: ResponseParam404): unknown
  error404NotImplemented(): unknown
  error405(arg0?: ResponseParam405): unknown
  error422(arg0?: BasicResponseParam): unknown
  error500(arg0?: BasicResponseParam): unknown
}
