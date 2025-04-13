/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { SignedFetch } from 'activitypub-http-signatures'
import { type Configuration, Json, type Request } from '@csjewell-activitypub/general'
import type * as AP from '@csjewell-activitypub/types'

export class StandardSender implements Request.Sender<Response> {
  private config   : Configuration<unknown, unknown>
  private username : string

  constructor(config: Configuration<unknown, unknown>, username: string) {
    this.config = config
    this.username = username
  }

  sendSignedRequest(endpoint: URL, object: AP.Activity): Response {
    const publicKeyId = `${ this.config.url.toString() }activitypub/${ this.username }#main-key`

    // TODO: [2025-04-19] Get this right.
    const privateKey = ''

    console.info('object:', object)

    const signedFetch = SignedFetch.sha256(fetch, { publicKeyId, privateKey, })
    let response = new Response()

    void signedFetch(endpoint.toString(), {
      method  : 'POST',
      headers : {
        'content-type' : 'application/activity+json',
        'accept'       : 'application/activity+json, application/ld+json',
      },
      body : Json.stringify(object),
    }).then((resp) => {
      response = resp
    })
    return response
  }
}
