/* SPDX-License-Identifier: MIT */
import * as Json from '@csjewell-activitypub/json'
import type * as Kit from '@csjewell-activitypub/general'
import type * as AP from '@csjewell-activitypub/types'

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
class StandardResponses implements Kit.Responses {
  /*
   * Provides the default Headers for most routines in KitResponses
   *
   * This is private but overridable.
   *
   * @private
   */
  getHeaders(cors: boolean = CORS): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/activity+json',
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
    }
    if (cors) {
      h['Access-Control-Allow-Origin'] = '*'
    }
    return h
  }

  _headers(cors: boolean = CORS): Headers {
    return new Headers(this.getHeaders(cors))
  }

  success200(object: AP.CoreObject): Response {
    const json = Json.stringify(object)
    return new Response(json, {
      status: 200,
      statusText: 'OK',
      headers: this._headers(),
    })
  }

  /*
   * Returns a 202 response
   *
   * @param info String to put into the response and into the response's
   *             status text. The default is 'Accepted'.
   *
   * @returns Response to return to browser.
   */
  success202(info = 'Created Reply'): Response {
    let statusText = 'Accepted'
    if (info !== '') {
      statusText = info
    }

    return Response.json({
      message: info,
    }, {
      status: 202,
      statusText,
      headers: this._headers(),
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
  success204(info = ''): Response {
    let statusText = 'No Content'
    if (info !== '') {
      statusText = statusText.concat(` (${info})`)
    }

    const headers = this._headers(NO_CORS)

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
   * OPTIONS and GET do not need to be included.
   *
   * @param headers
   * Additional headers to grant CORS access to for this endpoint.
   * Accept and Content-Type do not need to be included.
   *
   * @returns Response to return to browser.
   */
  options204(_methods: Array<string> = [], _allowHeaders: Array<string> = []): Response {
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
      'Access-Control-Max-Age': '31536000', // 1 year.
      'X-Clacks-Overhead': 'GNU Terry Pratchett',
    })
    return new Response(null, {
      status: 204,
      statusText: 'No Content',
      headers,
    })
  }

  redirect30x(url: string, statusCode: 301 | 302 | 303 | 307 | 308 = 301): Response {
    return Response.redirect(url, statusCode)
  }

  /*
   * Returns a 404 response
   *
   * @param info The type of thing that has not been found
   * @default 'User'
   */
  error404(info = 'User'): Response {
    return Response.json({
      success: false,
      error: `${info} Not Found`,
    }, {
      status: 404,
      statusText: `${info} Not Found`,
      headers: this._headers(),
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
  error405(info = 'POST'): Response {
    return Response.json({
      success: false,
      error: `${info} Not Allowed`,
    }, {
      status: 405,
      statusText: 'Method Not Allowed',
      headers: this._headers(),
    })
  }

  /* */
  error422(info = ''): Response {
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
      headers: this._headers(),
    })
  }

  /* */
  error500(info = ''): Response {
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
      headers: this._headers(),
    })
  }
}

export const Responses: StandardResponses = new StandardResponses()
