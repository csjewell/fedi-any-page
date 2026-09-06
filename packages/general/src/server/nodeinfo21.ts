/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../configuration.ts'
import type * as Request from '../request.ts'
import type { Type as Responses } from '../responses.ts'
import type { APIHandler } from './types.ts'

/**
 * Handles web queries to the /.well-known/nodeinfo/2.1 URL
 *
 * Implements https://codeberg.org/fediverse/fep/src/branch/main/fep/f1d5/fep-f1d5.md
 */
// TODO: [2025-07-19] This should read the usage data from the database
export const NodeInfo21: APIHandler = <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  _req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  return Promise.resolve(resp.success200Str({
    body : JSON.stringify({
      version  : '2.1',
      software : {
        name       : 'Fedi Any Page kit',
        repository : 'https://codefloe.com/CSJewell/fedi-any-page',
        homepage   : 'https://fedi-any-page.curtisjewell.dev/',
        version    : 'v0.2.0-alpha.2',
      },
      protocols : ['activitypub'],
      services  : {
        inbound  : [],
        outbound : [],
        //        inbound  : ['rss2.0'],
        //        outbound : ['rss2.0'],
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
    }),
  }))
}
