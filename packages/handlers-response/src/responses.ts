/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { encodeUrl as toBase64 } from 'ab64'
import {
  type Cookies, Json, type Responses,
} from '@csjewell-activitypub/general'
import { StandardSender } from './sender.ts'
// import type * as AP from '@csjewell-activitypub/types'

/* eslint-disable-next-line @stylistic/comma-dangle -- false alarm */
type ResolvedHeadersType = Array<[string, string]>
type HeadersType = Record<string, string> | ResolvedHeadersType

/*
 * This class contains helpers to return the appropriate Response within the ActivityPub toolkit.
 *
 * Most of the helpers will return
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response | Response objects }
 * that they construct.
 *
 * @example
 * ```ts
 * import * as Helpers from 'jsr:@csjewell-activitypub/general'
import type { AuthCookies from '@csjewell-activitypub/general/database-mock/session-type.ts';
 *
 * return Helpers.Responses.error404NotImplemented()
 * ```
 */
class StandardResponses implements Responses.Type<Response> {
  sender(args: Responses.SenderParams<unknown>): Responses.Sender<Response> {
    return new StandardSender(args.config, args.username)
  }

  /*
   * Provides the default Headers for most routines in KitResponses
   *
   * This is private but overridable.
   *
   * @private
   */
  getHeaders({
    hasCors = true,
    addHeaders = [] as ResolvedHeadersType,
  } = {}): ResolvedHeadersType {
    const hdr: ResolvedHeadersType = [
      [ 'Content-Type', 'application/x-re-pliers+json' ],
      [ 'X-Clacks-Overhead', 'GNU Terry Pratchett' ],
    ]

    if (hasCors) {
      hdr.push([ 'Access-Control-Allow-Origin', '*' ])
    }

    return [ ...hdr, ...addHeaders ]
  }

  _resolve(
    headers = {} as HeadersType,
    cookies = undefined as Cookies | undefined,
  ): ResolvedHeadersType {
    const addH: ResolvedHeadersType = []

    if (Array.isArray(headers) && Array.isArray(headers[0])) {
      addH.push(...headers)
    } else {
      for (const [ k, v ] of Object.entries(headers as Record<string, string>)) {
        addH.push([ k, v ])
      }
    }

    if (cookies !== undefined) {
      const cookieHeaders = this.handleCookies(cookies)

      addH.push(...cookieHeaders)
    }

    return addH
  }

  handleCookies(cookies: Cookies): ResolvedHeadersType {
    const hdrs: ResolvedHeadersType = []

    if (cookies.actinfo === undefined) {
      hdrs.push([ 'Set-Cookie', 'actinfo=; Max-Age=-1; SameSite=Strict; Secure; HttpOnly;' ])
    } else {
      hdrs.push([ 'Set-Cookie', `actinfo=${ cookies.actinfo }; Max-Age=28800; SameSite=Strict; Secure; HttpOnly;` ])
    }

    if (cookies.actinf === undefined) {
      hdrs.push([ 'Set-Cookie', 'actinf=; Max-Age=-1; SameSite=Strict; Secure;' ])
    } else {
      const info = toBase64(JSON.stringify(cookies.actinf))

      hdrs.push([ 'Set-Cookie', `actinfo=${ info }; Max-Age=28800; SameSite=Strict; Secure; HttpOnly;` ])
    }

    return hdrs
  }

  _headers({
    hasCors = true,
    addHeaders = {},
    cookies = undefined as Cookies | undefined,
  } = {}): Headers {
    return new Headers(this.getHeaders({ hasCors, addHeaders: this._resolve(addHeaders, cookies), }))
  }

  success200Obj({ body, addHeaders = {}, cookies = undefined, }: {
    body        : Record<string, unknown>,
    addHeaders? : HeadersType,
    cookies?    : Cookies,
  }): Promise<Response> {
    // TODO: Add an assertion here.
    const json = Json.stringify(body)

    return Promise.resolve(new Response(json, {
      status     : 200,
      statusText : 'OK',
      headers    : this._headers({ addHeaders, cookies, }),
    }))
  }

  success200Str({ body, addHeaders = {}, cookies = undefined, }: {
    body        : string,
    addHeaders? : HeadersType,
    cookies?    : Cookies,
  }): Promise<Response> {
    return Promise.resolve(new Response(body, {
      status     : 200,
      statusText : 'OK',
      headers    : this._headers({ addHeaders, cookies, }),
    }))
  }

  success201({ identifiers, cookies = undefined, }: {
    identifiers : Array<string>,
    cookies?    : Cookies,
  }): Promise<Response> {
    const json = JSON.stringify({ success: true, })

    const addHeaders = this._resolve(
      identifiers.map((s) => { return [ 'Location', s ] }),
      cookies,
    )

    return Promise.resolve(new Response(json, {
      status     : 201,
      statusText : 'Created',
      headers    : this.getHeaders({ addHeaders, }),
    }))
  }


  /*
   * Returns a 202 response
   *
   * @param info String to put into the response and into the response's
   *             status text. The default is 'Accepted'.
   *
   * @returns Response to return to browser.
   */
  success202({ info = 'Created Reply', addHeaders = {}, } = {}): Response {
    let statusText = 'Accepted'

    if (info !== '') {
      statusText = info
    }

    return Response.json({
      message : info,
    }, {
      statusText,
      status  : 202,
      headers : this._headers({ addHeaders, }),
    })
  }

  /*
   * Returns a 204 response
   *
   * @param info String to append to the response's status text.
   *             The default is 'Accepted'.
   *
   * @returns Response to return to browser.
   */
  success204({ info = '', addHeaders = {}, } = {}): Response {
    let statusText = 'No Content'

    if (info !== '') {
      statusText = `${ statusText } (${ info })`
    }

    const headers = this._headers({ hasCors: false, addHeaders, })

    return new Response(null, {
      status : 204,
      statusText,
      headers,
    })
  }

  /*
   * Returns a 204 response suitable for return when the OPTIONS verb
   * has been requested.
   *
   * @param methods
   * Additional methods to grant CORS access to for this endpoint.
   * OPTIONS, HEAD, and GET do not need to be included.
   *
   * @param headers
   * Additional headers to grant CORS access to for this endpoint.
   * Accept and Content-Type do not need to be included.
   *
   * @returns Response to return to browser.
   */
  options204({ methods = [] as Array<string>, allowHeaders = [] as Array<string>, } = {}): Response {
    methods.unshift('OPTIONS', 'GET', 'HEAD')
    allowHeaders.unshift('Accept', 'Content-Type')
    const headers = new Headers({
      'Access-Control-Allow-Origin'  : '*',
      'Access-Control-Allow-Methods' : methods.join(', '),
      'Access-Control-Allow-Headers' : allowHeaders.join(', '),
      // Max-Age of 1 year.
      'Access-Control-Max-Age'       : '31536000',
      'X-Clacks-Overhead'            : 'GNU Terry Pratchett',
    })

    return new Response(null, {
      status     : 204,
      statusText : 'No Content',
      headers,
    })
  }

  redirect30x({ url = '', statusCode = 301, } = {}): Response {
    if (url === '') {
      throw new TypeError('URL was empty')
    }

    return Response.redirect(url, statusCode)
  }

  error403({ info = '', addHeaders = {}, } = {}): Response {
    let statusText = 'Forbidden'

    if (info !== '') {
      statusText = `${ statusText } (${ info })`
    }

    return Response.json({
      success : false,
      error   : statusText,
    }, {
      statusText,
      status  : 403,
      headers : this._headers({ addHeaders, }),
    })
  }

  /*
   * Returns a 404 response
   *
   * @param info The type of thing that has not been found
   * @default 'User'
   */
  error404({ info = 'User', additional = '', addHeaders = {}, } = {}): Response {
    let statusText = `${ info } Not Found`

    if (additional !== '') {
      statusText = `${ statusText } (${ additional })`
    }
    const headers = this._headers({ hasCors: true, addHeaders, })

    return Response.json({
      success : false,
      error   : statusText,
    }, {
      status : 404,
      statusText,
      headers,
    })
  }

  /* */
  error404NotImplemented(): Response {
    return Response.json({
      success : false,
      error   : 'Not Implemented Yet',
    }, {
      status     : 404,
      statusText : 'Not Implemented Yet',
      headers    : this._headers(),
    })
  }

  /* */
  error405({
    info = 'POST',
    addMethods = [] as Array<string>,
    addHeaders = {},
  } = {}): Response {
    const headers: ResolvedHeadersType = this._resolve(addHeaders)

    addMethods.unshift('OPTIONS', 'GET', 'HEAD')
    headers.push([ 'Allow', addMethods.join(', ') ])
    return Response.json({
      success : false,
      error   : `${ info } Not Allowed`,
    }, {
      status     : 405,
      statusText : 'Method Not Allowed',
      headers    : this._headers({ addHeaders: headers, }),
    })
  }

  /* */
  error422({ info = '', addHeaders = {}, } = {}): Response {
    let statusText = 'Unprocessable Request'

    if (info !== '') {
      statusText = `${ statusText } (${ info })`
    }

    return Response.json({
      success : false,
      error   : statusText,
    }, {
      statusText,
      status  : 422,
      headers : this._headers({ addHeaders, }),
    })
  }

  /* */
  error500({ info = '', addHeaders = {}, } = {}): Response {
    let statusText = 'Server Error'

    if (info !== '') {
      statusText = `${ statusText } (${ info })`
    }

    return Response.json({
      success : false,
      error   : statusText,
    }, {
      statusText,
      status  : 500,
      headers : this._headers({ addHeaders, }),
    })
  }

  error503({ info = '', addHeaders = {}, } = {}): Response {
    let statusText = 'Service Unavailable'

    if (info !== '') {
      statusText = `${ statusText } (${ info })`
    }

    return Response.json({
      success : false,
      error   : statusText,
    }, {
      statusText,
      status  : 503,
      headers : this._headers({ addHeaders, }),
    })
  }
}

export const ActivityPub: StandardResponses = new StandardResponses()

/*
 * This class contains helpers to return the appropriate Response within the ActivityPub toolkit.
 *
 * Most of the helpers will return
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response | Response objects }
 * that they construct.
 *
 * @example ```ts
 * import * as Helpers from 'jsr:@csjewell-activitypub/general'
import toBase64 from 'core-js-pure/modules/esnext.uint8-array.to-base64';
import { Configuration } from '../../general/src/configuration';
 *
 * return Helpers.Responses.error404NotImplemented()
 * ```
 */
class WebFingerStandardResponses
  extends StandardResponses
  implements Responses.Type<Response> {
  /*
   * Provides the default Headers for most routines in KitResponses
   *
   * This is private but overridable.
   *
   * @private
   */
  override getHeaders({ addHeaders = [] as ResolvedHeadersType, } = {}): ResolvedHeadersType {
    return [
      [ 'Content-Type', 'application/jrd+json' ],
      [ 'X-Clacks-Overhead', 'GNU Terry Pratchett' ],
      [ 'Access-Control-Allow-Origin', '*' ],
      ...addHeaders,
    ]
  }

  override _headers({ addHeaders = {}, } = {}): Headers {
    return new Headers(this.getHeaders({ addHeaders: this._resolve(addHeaders), }))
  }

  override success200Obj(
    { body = {}, addHeaders = {}, } = {},
  ): Promise<Response> {
    return Promise.resolve(Response.json(body, {
      status     : 200,
      statusText : 'OK',
      headers    : this._headers({ addHeaders, }),
    }))
  }

  override success204({ info = '', addHeaders = {}, } = {}): Response {
    let statusText = 'No Content'

    if (info !== '') {
      statusText = `${ statusText } (${ info })`
    }

    return new Response(null, {
      statusText,
      status  : 204,
      headers : this._headers({ addHeaders, }),
    })
  }
}

export const WebFinger: WebFingerStandardResponses = new WebFingerStandardResponses()

class NodeInfoStandardResponses
  extends WebFingerStandardResponses
  implements Responses.Type<Response> {
  override getHeaders({ addHeaders = {} as ResolvedHeadersType, } = {}): ResolvedHeadersType {
    return [
      [ 'Content-Type', 'application/json; profile="http://nodeinfo.diaspora.software/ns/schema/2.1#' ],
      [ 'X-Clacks-Overhead', 'GNU Terry Pratchett' ],
      [ 'Access-Control-Allow-Origin', '*' ],
      ...addHeaders,
    ]
  }
}

export const NodeInfo: NodeInfoStandardResponses = new NodeInfoStandardResponses()

export class HTMLStandardResponses
  extends StandardResponses
  implements Responses.Type<Response> {
  override getHeaders({ addHeaders = {} as ResolvedHeadersType, } = {}): ResolvedHeadersType {
    return [
      [ 'Content-Type', 'text/html' ],
      [ 'X-Clacks-Overhead', 'GNU Terry Pratchett' ],
      ...addHeaders,
    ]
  }

  override success200Str({
    body = '',
    addHeaders = {},
  } = {}): Promise<Response> {
    const headers = this._headers({ addHeaders, })

    return Promise.resolve(new Response(body, {
      status     : 200,
      statusText : 'OK',
      headers,
    }))
  }

  override options204({ methods = [] as Array<string>, } = {}): Response {
    methods.unshift('OPTIONS', 'GET', 'HEAD')
    const allow = methods.join(', ')
    const headers = new Headers({
      'X-Clacks-Overhead' : 'GNU Terry Pratchett',
      'Allow'             : allow,
    })

    return new Response(null, {
      status     : 204,
      statusText : 'No Content',
      headers,
    })
  }
}

export const HTML: HTMLStandardResponses = new HTMLStandardResponses()
