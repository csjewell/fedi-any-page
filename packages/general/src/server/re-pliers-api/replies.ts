/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Responses } from '../../responses.ts'

// TODO: [2025-04-09] Remove the line below.
/* eslint '@typescript-eslint/require-await': 'warn' */

type APIHandler = <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
) => Promise<ResponseT>

export const Like: APIHandler = async <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
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

export const Reply: APIHandler = async <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const body = {}

  return resp.success200Obj({ body, })
}
