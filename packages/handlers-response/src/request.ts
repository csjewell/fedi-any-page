/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import {
  type Cookies, NotImplementedError, type Request,
} from '@csjewell-activitypub/general'

/*
 * This class contains helpers to process Request objects within the ActivityPub toolkit.
 */
export class StandardRequest implements Request.Helper {
  req : Request
  url : URL

  constructor(req: Request) {
    this.req = req
    this.url = new URL('')
  }

  /**
   * Can the current request accept HTML?
   * @returns boolean
   */
  canAcceptHTML(): boolean {
    const { headers, } = this.req
    const accept = headers.get('Accept') ?? ''

    return accept.split(',').includes('text/html')
  }

  /**
   * @returns AuthInputs object
   */
  getFormInputs = (): Request.AuthInputs => {
    throw new NotImplementedError()
  }

  /**
   * @returns ReplyActionInputs object
   */
  getReplyActionInputs = (): Request.ReplyActionInputs => {
    throw new NotImplementedError()
  }

  /**
   * @returns ReplyInputs object
   */
  getReplyInputs = (): Request.ReplyInputs => {
    throw new NotImplementedError()
  }

  /**
   * @returns CookieInputs object
   */
  getCookieInputs = (): Cookies => {
    throw new NotImplementedError()
  }

  /**
   * @returns AnnounceInputs object
   */
  getAnnounceInputs = (): Request.AnnounceInputs => {
    throw new NotImplementedError()
  }
}
