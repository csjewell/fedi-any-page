/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../configuration.ts'
import type { Helper } from '../request.ts'
import type { Type as Responses } from '../responses.ts'

export type APIHandlerSync = <DatabaseT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, SessionT>,
  req: Helper,
  resp: Responses<SessionT, ResponseT>,
) => ResponseT

export type APIHandler = <DatabaseT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, SessionT>,
  req: Helper,
  resp: Responses<SessionT, ResponseT>,
) => Promise<ResponseT>
