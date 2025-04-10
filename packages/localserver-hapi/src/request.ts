/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Request } from '@csjewell-activitypub/general'
import type Hapi from '@hapi/hapi'

export class HAPIRequest implements Request.Helper {
  private req : Hapi.Request
  public url  : URL

  constructor(req: Hapi.Request) {
    this.req = req
    this.url = new URL('')
  }

  canAcceptHTML(): boolean {
    return (this.req.headers.accept as string).includes('text/html')
  }

  getCookieInputs(): Request.SessionInputs {
    const inp = this.req.state.actinf as object

    if (Object.hasOwn(inp, 'sessionCookie')) {
      const { actor, sessionCookie, } = inp as Request.SessionInputs

      return { actor, sessionCookie, } as Request.SessionInputs
    }

    throw new TypeError('Sent the wrong stuff')
  }

  getFormInputs(): Request.AuthInputs {
    const inp = this.req.payload as object

    if (Object.hasOwn(inp, 'password')) {
      const { username, password, } = inp as { username: string, password: string, }

      return { username, password, } as Request.AuthInputs
    }

    throw new TypeError('Sent the wrong stuff')
  }
}

