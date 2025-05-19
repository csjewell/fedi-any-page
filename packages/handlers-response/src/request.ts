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

  canAcceptHTML(): boolean {
    const { headers, } = this.req
    const accept = headers.get('Accept') ?? ''

    return accept.split(',').includes('text/html')
  }

  getFormInputs = (): Request.AuthInputs => {
    throw new NotImplementedError()
  }

  getReplyActionInputs = (): Request.ReplyActionInputs => {
    throw new NotImplementedError()
  }

  getCookieInputs = (): Cookies => {
    throw new NotImplementedError()
  }

  getAnnounceInputs = (): Request.AnnounceInputs => {
    throw new NotImplementedError()
  }
}
