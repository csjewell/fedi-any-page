/* SPDX-License-Identifier: MIT */
import type * as Kit from '@csjewell-activitypub/general'

/*
 * This class contains helpers to process Request objects within the ActivityPub toolkit.
 */
export class StandardRequest implements Kit.RequestHelper {
  req: Request

  constructor(req: Request) {
    this.req = req
  }

  canAcceptHTML(): boolean {
    const { headers } = this.req
    const accept = headers.get('Accept') ?? ''
    return accept.split(',').includes('text/html')
  }
}
