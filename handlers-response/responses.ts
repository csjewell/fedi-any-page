/* SPDX-License-Identifier: MIT */
import * as Json from '@csjewell-activitypub/json'
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import type Responses from '@csjewell-activitypub/general/responses'
import type * as AP from '@csjewell-activitypub/types'

type RedirectCode = 301 | 302 | 303 | 307 | 308

/*
 * This class contains helpers to return the appropriate Response within the ActivityPub toolkit.
 *
 * Most of the helpers will return
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response | Response objects }
 * that they construct.
 *
 * @example ```ts
 * import * as Helpers from 'jsr:@csjewell-activitypub/general'
 *
 * return Helpers.Responses.error404NotImplemented()
 * ```
 */
const CORS = true, NO_CORS = false
class StandardResponses implements Responses {
  /*
   * Provides the default Headers for most routines in KitResponses
   *
   * This is private but overridable.
   *
   * @private
   */
  getHeaders({ cors = CORS, addHeaders = {} as Record<string, string> } = {}): Record<string, string> {
    const addH = addHeaders
    const h: Record<string, string> = {
      'Content-Type': 'application/activity+json',
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
    }

    if (cors) {
      h['Access-Control-Allow-Origin'] = '*'
    }

    return { ...h, ...addH }
  }

  _headers({ cors = CORS, addHeaders = {} as Record<string, string> } = {}): Headers {
    return new Headers(this.getHeaders({ cors, addHeaders }))
  }

  success200Obj({ body = {} as Record<string, unknown>, addHeaders = {} as Record<string, string> } = {}): Response {
    // TODO: Add an assertion here.
    const json = Json.stringify(body as AP.CoreObject)
    return new Response(json, {
      status: 200,
      statusText: 'OK',
      headers: this._headers({ addHeaders }),
    })
  }

  // deno-lint-ignore no-unused-vars
  success200Str({ body = '', addHeaders = {} as Record<string, string> } = {}): Response {
    throw new NotImplementedError()
  }

  /*
   * Returns a 202 response
   *
   * @param info String to put into the response and into the response's
   *             status text. The default is 'Accepted'.
   *
   * @returns Response to return to browser.
   */
  success202({ info = 'Created Reply', addHeaders = {} as Record<string, string> } = {}): Response {
    let statusText = 'Accepted'
    if (info !== '') {
      statusText = info
    }

    return Response.json({
      message: info,
    }, {
      status: 202,
      statusText,
      headers: this._headers({ addHeaders }),
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
  success204({ info = '', addHeaders = {} as Record<string, string> } = {}): Response {
    let statusText = 'No Content'
    if (info !== '') {
      statusText = statusText.concat(` (${info})`)
    }

    const headers = this._headers({ cors: NO_CORS, addHeaders })

    return new Response(null, {
      status: 204,
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
  options204({ methods = [] as Array<string>, allowHeaders = [] as Array<string> } = {}): Response {
    methods.unshift('OPTIONS', 'GET', 'HEAD')
    allowHeaders.unshift('Accept', 'Content-Type')
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': allowHeaders.join(', '),
      'Access-Control-Max-Age': '31536000', // 1 year.
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
    })
    return new Response(null, {
      status: 204,
      statusText: 'No Content',
      headers,
    })
  }

  redirect30x({ url = '', statusCode = 301 as RedirectCode } = {}): Response {
    if (url === '') {
      throw new TypeError('URL was empty')
    }
    return Response.redirect(url, statusCode)
  }

  /*
   * Returns a 404 response
   *
   * @param info The type of thing that has not been found
   * @default 'User'
   */
  error404({ info = 'User', additional = '', addHeaders = {} as Record<string, string> } = {}): Response {
    let statusText = `${info} Not Found`
    if (additional !== '') {
      statusText = statusText.concat(` (${additional})`)
    }
    const headers = this._headers({ cors: CORS, addHeaders })

    return Response.json({
      success: false,
      error: statusText,
    }, {
      status: 404,
      statusText,
      headers,
    })
  }

  /* */
  error404NotImplemented(): Response {
    return Response.json({
      success: false,
      error: 'Not Implemented Yet',
    }, {
      status: 404,
      statusText: 'Not Implemented Yet',
      headers: this._headers(),
    })
  }

  /* */
  error405(
    { info = 'POST', addMethods = [] as Array<string>, addHeaders = {} as Record<string, string> } = {},
  ): Response {
    addMethods.unshift('OPTIONS', 'GET', 'HEAD')
    const methods = addMethods.join(', ')

    return Response.json({
      success: false,
      error: `${info} Not Allowed`,
    }, {
      status: 405,
      statusText: 'Method Not Allowed',
      headers: this._headers({ addHeaders: { ...addHeaders, 'Allow': methods } }),
    })
  }

  /* */
  error422({ info = '', addHeaders = {} as Record<string, string> } = {}): Response {
    let statusText = 'Unprocessable Request'
    if (info !== undefined) {
      statusText = statusText.concat(` (${info})`)
    }

    return Response.json({
      success: false,
      error: statusText,
    }, {
      status: 422,
      statusText,
      headers: this._headers({ addHeaders }),
    })
  }

  /* */
  error500({ info = '', addHeaders = {} as Record<string, string> } = {}): Response {
    let statusText = 'Server Error'
    if (info !== '') {
      statusText = statusText.concat(` (${info})`)
    }

    return Response.json({
      success: false,
      error: statusText,
    }, {
      status: 500,
      statusText,
      headers: this._headers({ addHeaders }),
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
 *
 * return Helpers.Responses.error404NotImplemented()
 * ```
 */
class WebFingerStandardResponses extends StandardResponses implements Responses {
  /*
   * Provides the default Headers for most routines in KitResponses
   *
   * This is private but overridable.
   *
   * @private
   */
  override getHeaders({ addHeaders = {} as Record<string, string> } = {}): Record<string, string> {
    return {
      'Content-Type': 'application/jrd+json',
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
      'Access-Control-Allow-Origin': '*',
      ...addHeaders,
    } as Record<string, string>
  }

  override _headers({ addHeaders = {} as Record<string, string> } = {}): Headers {
    return new Headers(this.getHeaders({ addHeaders }))
  }

  override success200Obj(
    { body = {} as Record<string, unknown>, addHeaders = {} as Record<string, string> } = {},
  ): Response {
    return Response.json(body, {
      status: 200,
      statusText: 'OK',
      headers: this._headers({ addHeaders }),
    })
  }

  override success204({ info = '', addHeaders = {} as Record<string, string> } = {}): Response {
    let statusText = 'No Content'
    if (info !== '') {
      statusText = statusText.concat(` (${info})`)
    }

    return new Response(null, {
      status: 204,
      statusText,
      headers: this._headers({ addHeaders }),
    })
  }
}

export const WebFinger: WebFingerStandardResponses = new WebFingerStandardResponses()

class NodeInfoStandardResponses extends WebFingerStandardResponses implements Responses {
  override getHeaders({ addHeaders = {} as Record<string, string> } = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json; profile="http://nodeinfo.diaspora.software/ns/schema/2.1#',
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
      'Access-Control-Allow-Origin': '*',
      ...addHeaders,
    } as Record<string, string>
  }
}

export const NodeInfo: NodeInfoStandardResponses = new NodeInfoStandardResponses()

class HTMLStandardResponses extends StandardResponses implements Responses {
  override getHeaders({ addHeaders = {} as Record<string, string> } = {}): Record<string, string> {
    return {
      'Content-Type': 'text/html',
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
      ...addHeaders,
    } as Record<string, string>
  }

  override success200Str({ body = '', addHeaders = {} as Record<string, string> } = {}): Response {
    const headers = new Headers(this.getHeaders({ addHeaders }))
    return new Response(body as string, {
      status: 200,
      statusText: 'OK',
      headers,
    })
  }

  override options204({ methods = [] as Array<string> } = {}): Response {
    methods.unshift('OPTIONS', 'GET', 'HEAD')
    const allow = methods.join(', ')
    const headers = new Headers({
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
      'Allow': allow,
    })
    return new Response(null, {
      status: 204,
      statusText: 'No Content',
      headers,
    })
  }
}

export const HTML: HTMLStandardResponses = new HTMLStandardResponses()
