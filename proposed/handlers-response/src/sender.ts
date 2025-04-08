/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { SignedFetch } from 'activitypub-http-signatures'
import type * as Kit from '@csjewell-activitypub/general'
import type { default as Configuration } from '@csjewell-activitypub/general/configuration'
import type * as AP from '@csjewell-activitypub/types'

export class StandardSender implements Kit.Sender {
  private config   : Configuration
  private username : string

  constructor(config: Configuration, username: string) {
    this.config = config
    this.username = username
  }

  sendSignedRequest(endpoint: URL, object: AP.Activity): Response {
    const publicKeyId = `${ this.config.url }activitypub/${ this.username }#main-key`
    const {privateKey,} = this.config

    console.log('object:', object)

    const signedFetch = SignedFetch.sha256(fetch, { publicKeyId, privateKey, })
    let response = new Response()

    void signedFetch(endpoint.toString(), {
      method  : 'POST',
      headers : {
        'content-type' : 'application/activity+json',
        'accept'       : 'application/activity+json, application/ld+json',
      },
      body : Kit.Json.stringify(object),
    }).then((resp) => {
      response = resp
    })
    return response
  }
}
