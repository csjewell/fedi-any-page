/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Type as Responses } from '../../responses.ts'

export const setupPost = <ResponseT>(resp: Responses<ResponseT>): ResponseT => {
  return resp.error404NotImplemented()

  // Content-Disposition: attachment; filename="users.json"
}

