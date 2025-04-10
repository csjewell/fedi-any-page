/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Responses } from '../../responses.ts'

export const setupPost = <SessionT, ResponseT>(resp: Responses<SessionT, ResponseT>): ResponseT => {
  return resp.error404NotImplemented()

  // Content-Disposition: attachment; filename="users.json"
}

