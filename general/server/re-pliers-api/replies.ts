/* SPDX-License-Identifier: MIT */
import type * as AP from '@csjewell-activitypub/types'
import type * as Kit from '../../interfaces.ts'
import type Responses from '../../responses.ts'
import type Configuration from '../../configuration.ts'

export default function Like(config: Configuration, req: Kit.RequestHelper, resp: Responses): unknown {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301 })
  }

  // const key = config.database().keys(`${url}activitypub/server/#public-key`).getPublicKey()
  const key = '' // TODO: Uncomment the above line.

  return resp.success200Obj({ body })
}
