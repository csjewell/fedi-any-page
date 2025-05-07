/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  deleteCookie, type H3Event, type SessionConfig, setCookie, useSession,
} from 'h3'
import { HTMLStandardResponses } from '@csjewell-activitypub/handlers-response'
import type { Cookies, Responses, SessionData } from '@csjewell-activitypub/general'

type SessionType = Awaited<ReturnType<typeof useSession<SessionData>>>

/**
 * Class that implements the responses.
 * @class
 */
export class H3RespHelper
  extends HTMLStandardResponses
  implements Responses.Type<Response> {
  private event      : H3Event
  private sessionCfg : SessionConfig
  private session    : SessionType | undefined
  private isSecure   : boolean

  constructor(isTest: boolean, event: H3Event, sessionCfg: SessionConfig) {
    super()
    this.event = event
    this.sessionCfg = sessionCfg
    this.isSecure = !isTest
  }

  async init(): Promise<void> {
    this.session = await useSession<SessionData>(this.event, this.sessionCfg)
  }

  override handleCookies: (cookies: Cookies) => Responses.ResolvedHeaders
    = (cookies): Responses.ResolvedHeaders => {
      if (cookies.actinfo === undefined) {
        void this.session!.clear()
      } else {
        void this.session!.update({ key: cookies.actinfo, })
      }

      if (cookies.actinf === undefined) {
        deleteCookie(this.event, 'actinf')
      } else {
        setCookie(this.event, 'actinf', cookies.actinf, {
          maxAge   : 3600 * 9,
          secure   : this.isSecure,
          httpOnly : false,
          sameSite : true,
        })
      }

      return []
    }

  override success200Obj: (argHash: {
    body        : Record<string, unknown>
    addHeaders? : Responses.HeadersType
    cookies?    : Cookies,
  }) => Promise<Response> = async ({ body, addHeaders, cookies, }): Promise<Response> => {
      if (cookies !== undefined) {
        this.handleCookies(cookies)
      }

      return super.success200Obj({ body, addHeaders, })
    }

  override success200Str: (argHash: {
    body        : string
    addHeaders? : Responses.HeadersType
    cookies?    : Cookies
  }) => Promise<Response> = async ({ body, addHeaders, cookies, }): Promise<Response> => {
      if (cookies !== undefined) {
        this.handleCookies(cookies)
      }

      return super.success200Str({ body, addHeaders, })
    }
}
