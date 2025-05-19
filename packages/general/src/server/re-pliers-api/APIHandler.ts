/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Type as Responses } from '../../responses.ts'

export type APIHandler = <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
) => Promise<ResponseT>

