/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Type as Responses } from '../../responses.ts'
import type { APIHandler } from './types.ts'

// TODO: [2025-04-09] Remove the line below.
/* eslint '@typescript-eslint/require-await': 'warn' */

export const Like: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  // const key = config.database().keys(`${url}activitypub/server/#public-key`).getPublicKey()
  // TODO [2025-04-07]: Uncomment the above line.
  const _key = ''
  const body = {}

  return resp.success200Obj({ body, })
}

export const Reply: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const body = {}

  return resp.success200Obj({ body, })
}
