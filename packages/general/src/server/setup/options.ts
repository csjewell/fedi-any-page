/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Responses } from '../../responses.ts'

const setupOptions = <SessionT, ResponseT>(resp: Responses<SessionT, ResponseT>): ResponseT => {
  const addHeaders = {
    Allow : 'OPTIONS, GET, HEAD, POST',
  }

  return resp.options204({ addHeaders, })
}

export default setupOptions
