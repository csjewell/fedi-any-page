/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Responses, Server } from '@csjewell-activitypub/general'
import type Hapi from '@hapi/hapi'

type AuthCookies = Server.RePliers.AuthInfo

/* eslint-disable-next-line @stylistic/comma-dangle -- false alarm */
type ResolvedHeadersType = Array<[string, string]>
type HeadersType = Record<string, string> | ResolvedHeadersType

/**
 * Provides the standard responses for the \@csjewell-activitypub scope using
 * the \@hapi/hapi framework.
 *
 * @class
 */
/* eslint "sonarjs/no-identical-functions": "off" -- The overrides just work that way */
export class HAPIResponses implements Responses<AuthCookies, Hapi.ResponseObject> {
  private h    : Hapi.ResponseToolkit
  private resp : Hapi.ResponseObject | undefined = undefined

  constructor(h: Hapi.ResponseToolkit) {
    this.h = h
  }

  /**
   * Provides the default Headers for most routines in KitResponses
   *
   * This is private but overridable.
   *
   * @private
   */
  getHeaders({ hasCors = true, addHeaders = [] as ResolvedHeadersType, } = {}): ResolvedHeadersType {
    const hdr: ResolvedHeadersType = [
      [ 'Content-Type', 'application/x-re-pliers+json' ],
      [ 'X-Clacks-Overhead', 'GNU Terry Pratchett' ],
    ]

    if (hasCors) {
      hdr.push([ 'Access-Control-Allow-Origin', '*' ])
    }

    return [ ...hdr, ...addHeaders ]
  }

  _resolve(headers = {} as HeadersType): ResolvedHeadersType {
    if (Array.isArray(headers) && Array.isArray(headers[0])) {
      return headers
    }

    const addH: ResolvedHeadersType = []

    for (const [ k, v ] of Object.entries(headers as Record<string, string>)) {
      addH.push([ k, v ])
    }

    return addH
  }

  _headers({ hasCors = true, addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    const { resp, } = this

    if (resp === undefined) {
      throw new TypeError('Needed to call _body first')
    }

    this.getHeaders({ hasCors, addHeaders: this._resolve(addHeaders), }).forEach((element) => {
      const [ key, value ] = element

      resp.header(key, value)
    })
    return resp
  }

  _cookies(cookies: AuthCookies): Hapi.ResponseObject {
    let { resp, } = this

    if (resp === undefined) {
      throw new TypeError('Needed to call _body first')
    }

    for (const [ key, value ] of Object.entries(cookies)) {
      if (value === undefined) {
        resp = resp.unstate(key)
      } else {
        resp = resp.state(key, value)
      }
    }

    this.resp = resp
    return resp
  }

  _body(body = undefined as Record<string, unknown> | string | undefined): Hapi.ResponseObject {
    if (body === undefined) {
      this.resp = this.h.response()
    } else {
      this.resp = this.h.response(body)
    }

    return this.resp
  }

  success200Obj({
    body = {} as Record<string, unknown>,
    addHeaders = {} as HeadersType,
    cookies = undefined as AuthCookies | undefined,
  } = {}): Hapi.ResponseObject {
    this._body(body)

    if (cookies !== undefined ) {
      this._cookies(cookies)
    }

    return this._headers({ addHeaders, }).code(200)
  }

  success200Str({
    body = '',
    addHeaders = {} as HeadersType,
    cookies = undefined as AuthCookies | undefined,
  } = {}): Hapi.ResponseObject {
    this._body(body)

    if (cookies !== undefined) {
      this._cookies(cookies)
    }

    return this._headers({ addHeaders, }).code(200)
  }

  /**
   * Returns a 202 response
   *
   * @param info - String to put into the response and into the response's
   * status text.
   * @default 'Accepted'.
   *
   * @returns Response to return to browser.
   */
  success202({ info = 'Created Reply', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    const statusText = info === '' ? 'Accepted' : info

    this._body({ message: info, })
    return this._headers({ addHeaders, }).message(statusText).code(202)
  }

  /**
   * Returns a 204 response
   *
   * @param info String to append to the response's status text.
   *             The default is 'No Content'.
   *
   * @returns Response to return to browser.
   */
  success204({ info = '', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    let statusText = 'No Content'

    if (info !== '') {
      statusText += ` (${ info })`
    }

    this._body()
    return this._headers({ hasCors: false, addHeaders, }).message(statusText).code(204)
  }

  // Unused, HAPI does its own OPTIONS handling.
  options204(): Hapi.ResponseObject { throw new Error('Not implemented') }

  /**
   * Returns a 30x response
   *
   * @param url - URL to redirect to.
   * @param statusCode - which status code to use when redirecting.
   *
   * @returns A redirection response to be sent to the browser.
   * @throws {TypeError} - URL was empty.
   */
  redirect30x({ url = '', statusCode = 301 as 301 | 302 | 303 | 307 | 308, } = {}): Hapi.ResponseObject {
    if (url === '') {
      throw new TypeError('URL was empty')
    }

    this._body()
    return this._headers().location(url).code(statusCode)
  }

  /**
   * Returns a 403 response
   *
   * @param info - Information on what or why something is forbidden,
   * @default ''
   *
   * @param addHeaders - TODO [2025-04-10]
   */
  error403({ info = '', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    let statusText = 'Forbidden'

    if (info !== '') {
      statusText += ` (${ info })`
    }

    this._body({
      success : false,
      error   : statusText,
    })
    return this._headers({ addHeaders, }).message(statusText).code(403)
  }

  /**
   * Returns a 404 (Not found) response
   *
   * @param info The type of thing that has not been found
   * @default 'User'
   *
   * @param addHeaders - TODO [2025-04-10]
   */
  error404({ info = 'User', additional = '', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    let statusText = `${ info } Not Found`

    if (additional !== '') {
      statusText += ` (${ additional })`
    }

    this._body({
      success : false,
      error   : statusText,
    })
    return this._headers({ hasCors: true, addHeaders, }).message(statusText).code(404)
  }

  /**
   * Returns a 404 response specifying that something has not been implemented yet.
   */
  error404NotImplemented(): Hapi.ResponseObject {
    const statusText = 'Not Implemented Yet'

    this._body({
      success : false,
      error   : statusText,
    })
    return this._headers().message(statusText).code(404)
  }

  /**
   * Returns a 405 (Method not allowed) response
   *
   * @param info {string} - The method being disallowed
   * @default 'POST'
   *
   * @param addMethods {Array<string>} - The additional methods that are allowed.
   *
   * @param addHeaders {Record<string, string>} - TODO [2025-04-10]
   */
  error405({
    info = 'POST',
    addMethods = [] as Array<string>,
    addHeaders = {} as HeadersType,
  } = {}): Hapi.ResponseObject {
    addMethods.unshift('OPTIONS', 'GET', 'HEAD')
    const hdrs = this._resolve(addHeaders)

    hdrs.push([ 'Allow', addMethods.join(', ') ])
    this._body({
      success : false,
      error   : `${ info } Not Allowed`,
    })
    return this._headers({ addHeaders: hdrs, }).message('Method Not Allowed').code(405)
  }

  /* */
  error422({ info = '', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    let statusText = 'Unprocessable Request'

    if (info !== '') {
      statusText += ` (${ info })`
    }

    this._body({
      success : false,
      error   : statusText,
    })
    return this._headers({ addHeaders, }).message(statusText).code(422)
  }

  /* */
  error500({ info = '', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    let statusText = 'Server Error'

    if (info !== '') {
      statusText += ` (${ info })`
    }

    this._body({
      success : false,
      error   : statusText,
    })
    return this._headers({ addHeaders, }).message(statusText).code(500)
  }

  /* */
  error503({ info = '', addHeaders = {} as HeadersType, } = {}): Hapi.ResponseObject {
    let statusText = 'Service Unavailable'

    if (info !== '') {
      statusText += ` (${ info })`
    }

    this._body({
      success : false,
      error   : statusText,
    })
    return this._headers({ addHeaders, }).message(statusText).code(503)
  }
}
