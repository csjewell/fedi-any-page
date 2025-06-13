/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  getCookie, getRequestHeader, getRequestURL, type H3Event, type SessionConfig,
  useSession,
} from 'h3'
import { useValidatedBody } from 'h3-valibot'
import { type Cookies, Request, type SessionData } from '@csjewell-activitypub/general'

type SessionType = Awaited<ReturnType<typeof useSession<SessionData>>>

/**
 * Class that implements the server request helpers.
 * @class
 */
export class H3Request implements Request.Helper {
  private event      : H3Event
  private sessionCfg : SessionConfig
  private session    : SessionType | undefined
  public url         : URL

  constructor(event: H3Event, sessionCfg: SessionConfig) {
    this.event = event
    this.sessionCfg = sessionCfg
    this.url = getRequestURL(event)
  }

  async init(): Promise<void> {
    this.session = await useSession<SessionData>(this.event, this.sessionCfg)
  }

  canAcceptHTML = (): boolean => {
    const contentType = getRequestHeader(this.event, 'Content-Type')

    return contentType === undefined ? false : contentType.includes('text/html')
  }

  getFormInputs = async (): Promise<Request.AuthInputs> => {
    const inputs = await useValidatedBody(this.event, Request.AuthInputsSchema)

    return inputs as Request.AuthInputs
  }

  getCookieInputs = (): Cookies => {
    return {
      actinf  : getCookie(this.event, 'actinf'),
      actinfo : this.session!.data.key,
    }
  }

  getReplyActionInputs = async (): Promise<Request.ReplyActionInputs> => {
    const inputs = await useValidatedBody(
      this.event, Request.ReplyActionBodySchema,
    ) as Request.ReplyActionBody

    const { unconvertedAction, } = ( this.event.context.params! )

    const action = unconvertedAction as 'like' | 'hide'

    return { ...inputs, action, } as Request.ReplyActionInputs
  }

  getReplyInputs = async (): Promise<Request.ReplyInputs> => {
    const inputs = await useValidatedBody(this.event, Request.ReplyInputsSchema)

    return inputs as Request.ReplyInputs
  }

  getAnnounceInputs = async (): Promise<Request.AnnounceInputs> => {
    const inputs = await useValidatedBody(this.event, Request.AnnounceInputsSchema)

    return inputs as Request.AnnounceInputs
  }
}
