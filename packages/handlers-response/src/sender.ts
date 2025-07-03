/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { SignedFetch } from 'activitypub-http-signatures'
import { type Configuration, Json, type Responses } from '@csjewell-activitypub/general'
import type * as AP from '@csjewell-activitypub/types'

export class StandardSender implements Responses.Sender<Response> {
  private config   : Configuration<unknown>
  private username : string

  constructor(config: Configuration<unknown>, username: string | undefined) {
    this.config = config
    this.username = username ?? 'server'
  }

  /**
   * @returns A Promise that resolves to a Response
   */
  async sendSignedRequest(endpoint: URL, object: AP.Activity): Promise<Response> {
    const url = this.config.url.toString()
    const keyInfo = this.config.database.keys(`${ url }activitypub/${ this.username }`)

    const publicKeyId = `${ this.config.url.toString() }activitypub/${ this.username }/#main-key`

    const privateKey = await keyInfo.getPrivateKey()

    const signedFetch = SignedFetch.sha256(fetch, { publicKeyId, privateKey, })

    return await signedFetch(endpoint.toString(), {
      method  : 'POST',
      headers : {
        'content-type' : 'application/activity+json',
        'accept'       : 'application/activity+json, application/ld+json',
        'user-agent'   : 'Fedi-Any-Page/' + 'v0.2.0-alpha.2',
      },
      body : Json.stringify(object),
    })
  }
}
