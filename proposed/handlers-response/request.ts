/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as Request from '@csjewell-activitypub/general'

/*
 * This class contains helpers to process Request objects within the ActivityPub toolkit.
 */
export class StandardRequest implements Request.Helper {
  req : Request

  constructor(req: Request) {
    this.req = req
  }

  canAcceptHTML(): boolean {
    const { headers, } = this.req
    const accept = headers.get('Accept') ?? ''

    return accept.split(',').includes('text/html')
  }
}
