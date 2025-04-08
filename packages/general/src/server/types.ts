/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../configuration.ts'
import type { Helper } from '../request.ts'
import type { Responses } from '../responses.ts'

export type APIHandlerSync = <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Helper,
  resp: Responses<SessionT, ResponseT>,
) => ResponseT
