/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Responses } from '../../responses.ts'

export type APIHandler = <DatabaseT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
) => Promise<ResponseT>

