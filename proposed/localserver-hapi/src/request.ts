/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type Hapi from '@hapi/hapi'
import type {
  AuthInputs,
  Helper as RequestHelper,
  SessionInputs,
} from '../general/interfaces.ts'

export default class HAPIRequest implements RequestHelper {
  private req : Hapi.Request

  constructor(req: Hapi.Request) { this.req = req }

  canAcceptHTML(): boolean {
    return (this.req.headers.accept as string).includes('text/html')
  }

  getCookieInputs(): SessionInputs {
    const inp = this.req.state.actinf as object

    if (Object.hasOwn(inp, 'sessionCookie')) {
      const { actor, sessionCookie, } = inp as SessionInputs

      return { actor, sessionCookie, } as SessionInputs
    }

    throw new TypeError('Sent the wrong stuff')
  }

  getFormInputs(): AuthInputs {
    const inp = this.req.payload as object

    if (Object.hasOwn(inp, 'password')) {
      const { username, password, } = inp as { username: string, password: string, }

      return { username, password, } as AuthInputs
    }

    throw new TypeError('Sent the wrong stuff')
  }
}

