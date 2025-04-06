/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../configuration.ts'
import type * as Request from '../request.ts'
import type { Responses } from '../responses.ts'

type APIHandlerSync = <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
) => ResponseT

export const NodeInfo: APIHandlerSync = <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  _req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): ResponseT => {
  return resp.success200Obj({
    body : {
      links : [
        {
          /* eslint-disable-next-line sonarjs/no-clear-text-protocols -- this is an identifier, not a real URL. */
          rel  : 'http://nodeinfo.diaspora.software/ns/schema/2.1',
          href : `${ config.url.toString() }nodeinfo/2.1`,
        },
      ],
    },
  })
}
