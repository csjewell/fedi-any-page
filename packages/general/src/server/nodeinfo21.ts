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

// TODO: [2025-04-10] This should read the usage data from the database
export const NodeInfo21: APIHandlerSync = <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  _req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): ResponseT => {
  return resp.success200Obj({
    body : {
      version  : '2.1',
      software : {
        name       : 'Fedipage-kit',
        repository : 'https://github.com/csjewell/activitypage-ts-kit/',
        homepage   : 'https://csjewell.github.io/activitypage-ts-kit/',
        version    : 'v0.1.0',
      },
      protocols : ['activitypub'],
      services  : {
        inbound  : ['rss2.0'],
        outbound : ['rss2.0'],
      },
      openRegistrations : false,
      usage             : {
        users : {
          total          : 1,
          activeHalfyear : 1,
          activeMonth    : 1,
        },
      },
      metadata : {
        nodeName : config.siteName,
      },
    },
  })
}
