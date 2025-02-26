/* SPDX-License-Identifier: MIT */
import { SignedFetch } from 'activitypub-http-signatures'
import * as Json from '@csjewell-activitypub/json'
import type { Kit } from '@csjewell-activitypub/general'
import type { AP } from 'activitypub-core-types'

export class StandardSender implements Kit.Sender {
  private config: Kit.Configuration
  private username: string

  constructor(config: Kit.Configuration, username: string) {
    this.config = config
    this.username = username
  }

  sendSignedRequest(endpoint: URL, object: AP.Activity): Response {
    const publicKeyId = `${this.config.URL}activitypub/${this.username}#main-key`
    const privateKey = this.config.PrivateKey
    console.log('object:', object)

    const signedFetch = SignedFetch.sha256(fetch, { publicKeyId, privateKey })
    let response = new Response()
    void signedFetch(endpoint.toString(), {
      method: 'POST',
      headers: {
        'content-type': 'application/activity+json',
        accept: 'application/activity+json, application/ld+json',
      },
      body: Json.stringify(object),
    }).then((resp) => {
      response = resp
    })

    return response
  }
}
