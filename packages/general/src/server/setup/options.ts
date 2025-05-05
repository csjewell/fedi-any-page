/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Type as Responses } from '../../responses.ts'

export const setupOptions = <ResponseT>(resp: Responses<ResponseT>): ResponseT => {
  const addHeaders = {
    Allow : 'OPTIONS, GET, HEAD, POST',
  }

  return resp.options204({ addHeaders, })
}

