/* SPDX-License-Identifier: Apache-2.0 */
import type * as AP from '@csjewell-activitypub/types'
import type * as Kit from './interfaces.ts'

export function serverActor(config: Kit.Configuration, req: Kit.RequestHelper, resp: Kit.Responses): unknown {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x(url, 301)
  }

  // const key = config.database().keys(`${url}actor#public-key`).getPublicKey()
  const key = '' // TODO: Uncomment the above line.

  const response = {
    '@context': new URL('https://www.w3.org/ns/activitystreams'),
    type: 'Application',
    id: new URL(`${url}actor`),
    outbox: new URL(`${url}actor/outbox`),
    inbox: new URL(`${url}actor/inbox`),
    preferredUsername: config.url.hostname,
    name: 'ActivityPub TypeScript Kit',
    summary: 'A set of TypeScript modules designed to complement static-page sites',
    publicKey: {
      '@context': new URL('https://w3id.org/security/v1'),
      '@type': 'Key',
      id: `${url}actor#public-key`,
      owner: `${url}actor`,
      publicKeyPem: key,
    },
  } as AP.Application

  return resp.success200(response)
}
