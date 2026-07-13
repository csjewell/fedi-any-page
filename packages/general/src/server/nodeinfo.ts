/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../configuration.ts'
import type * as Request from '../request.ts'
import type { Type as Responses } from '../responses.ts'
import type { APIHandler } from './types.ts'

/**
 * Handles web queries to the /.well-known/nodeinfo URL
 *
 * Implements the discovery part of
 * https://codeberg.org/fediverse/fep/src/branch/main/fep/f1d5/fep-f1d5.md
 */
export const NodeInfo: APIHandler = <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  _req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  return Promise.resolve(resp.success200Str({
    body : JSON.stringify({
      links : [
        {
          rel  : 'http://nodeinfo.diaspora.software/ns/schema/2.1',
          href : `${ config.url.toString() }nodeinfo/2.1`,
        },
      ],
    }),
  }))
}
