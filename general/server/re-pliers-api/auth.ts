/* SPDX-License-Identifier: MIT */
// import type * as AP from '@csjewell-activitypub/types'
import type * as Kit from '../../interfaces.ts'
import type Responses from '../../responses.ts'
import type Configuration from '../../configuration.ts'

export async function Login(config: Configuration, req: Kit.RequestHelper, resp: Responses): unknown {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301 })
  }

  const { username, password } = req.getInputs()

  const userinfo = config.database().users(username)
  if (!userinfo.exists()) {
    return resp.error404({ info: 'Login' })
  }

  if (!userinfo.goodPassword(password)) {
    return resp.error404({ info: 'Login' })
  }

  const session = config.database().newSession(username)
  if (!session.exists()) {
    return resp.error503({ info: 'Could not create session' })
  }

  const body = {
    success: true,
    actor: session.actor(),
  }

  return resp.success200Obj({ body, cookie: session.getCookie() })
}

export async function Verify(config: Configuration, req: Kit.RequestHelper, resp: Responses): unknown {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301 })
  }

  const { actor, sessionCookie } = req.getInputs()

  const session = config.database().session(sessionCookie)
  if (!session.exists()) {
    return resp.error403()
  }

  if (!session.valid(actor)) {
    return resp.error403()
  }

  const body = {
    success: true,
    actor,
  }
  return resp.success200Obj({ body, cookie: session.refreshCookie() })
}

export async function Logout(config: Configuration, req: Kit.RequestHelper, resp: Responses): unknown {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301 })
  }

  const { actor, sessionCookie } = req.getInputs()

  const session = config.database.session(sessionCookie)
  if (!session.exists()) {
    session.invalidate()
  }

  const body = { success: true, actor: '' }
  return resp.success200({ body, cookie: session.clearingCookie() })
}
