/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type * as AP from '@csjewell-activitypub/types'
import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Responses } from '../../responses.ts'

export const appIndex = <DatabaseT, SessionReturnT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, SessionReturnT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): ResponseT => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  // const key = config.database().keys(`${url}activitypub/server/#public-key`).getPublicKey()
  // TODO: Uncomment the above line.
  const key = ''

  const body = {
    '@context'          : new URL('https://www.w3.org/ns/activitystreams'),
    'type'              : 'Application',
    'id'                : new URL(`${ url }server/`),
    'outbox'            : new URL(`${ url }server/outbox`),
    'inbox'             : new URL(`${ url }server/inbox`),
    'preferredUsername' : config.url.hostname,
    'name'              : 'ActivityPub TypeScript Kit',
    'summary'           : 'A set of TypeScript modules designed to complement static-page sites',
    'publicKey'         : {
      '@context'     : new URL('https://w3id.org/security/v1'),
      '@type'        : 'Key',
      'id'           : `${ url }server/#public-key`,
      'owner'        : `${ url }server/`,
      'publicKeyPem' : key,
    },
  } as AP.Application

  return resp.success200Obj({ body, })
}
