/* SPDX-License-Identifier: Apache-2.0 */
import type * as AP from '@csjewell-activitypub/types'
import type * as Kit from './interfaces.ts'

export function GetHandler(config: Kit.Configuration, req: Kit.RequestHelper, resp: Kit.Responses): unknown {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301 })
  }

  // const key = config.database().keys(`${url}activitypub/server/#public-key`).getPublicKey()
  const key = '' // TODO: Uncomment the above line.

  const body = {
    '@context': new URL('https://www.w3.org/ns/activitystreams'),
    type: 'Application',
    id: new URL(`${url}server/`),
    outbox: new URL(`${url}server/outbox`),
    inbox: new URL(`${url}server/inbox`),
    preferredUsername: config.url.hostname,
    name: 'ActivityPub TypeScript Kit',
    summary: 'A set of TypeScript modules designed to complement static-page sites',
    publicKey: {
      '@context': new URL('https://w3id.org/security/v1'),
      '@type': 'Key',
      id: `${url}server/#public-key`,
      owner: `${url}server/`,
      publicKeyPem: key,
    },
  } as AP.Application

  return resp.success200Obj({ body })
}
