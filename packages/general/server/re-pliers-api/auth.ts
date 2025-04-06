/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Responses } from '../../responses.ts'

type APIHandler = <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
) => Promise<ResponseT>

export const Login: APIHandler = async <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const { username, password, } = req.getFormInputs()

  const userinfo = config.database.users(username)

  if (!await userinfo.exists()) {
    return resp.error404({ info: 'Login', })
  }

  if (!await userinfo.checkPassword(password)) {
    return resp.error404({ info: 'Login', })
  }

  const actorFunc = (arg0: string): string => config.getActorURL(arg0)
  const session = await config.database.newSession(username, actorFunc)

  if (!await session.exists()) {
    return resp.error503({ info: 'Could not create session', })
  }

  const body = {
    success : true,
    actor   : config.getActorURL(username),
  }
  const cookies = await session.getCookies(actorFunc)

  return resp.success200Obj({ body, cookies, })
}

export const Verify: APIHandler = async <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const { actor, sessionCookie, } = req.getCookieInputs()

  // TODO: [2025-04-07] Get the correct username parameter.
  const session = await config.database.session('', sessionCookie as string)

  if (!await session.exists()) {
    return resp.error403()
  }

  // TODO: [2025-04-07] Get the type right and uncomment.
  // if (!await session.valid(actor)) {
  //   return resp.error403()
  // }

  const actorFunc = (username: string): string => config.getActorURL(username)
  const body = {
    success : true,
    actor,
  }
  const cookies = await session.refreshCookies(actorFunc)

  return resp.success200Obj({ body, cookies, })
}

export const Logout: APIHandler = async <DatabaseT, TableT, SessionT, ResponseT>(
  config: Configuration<DatabaseT, TableT, SessionT>,
  req: Request.Helper,
  resp: Responses<SessionT, ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const { sessionCookie, } = req.getCookieInputs()

  // TODO: [2025-04-07] Get the correct username parameter.
  const session = await config.database.session('', sessionCookie as string)

  if (await session.exists()) {
    await session.invalidate()
  }

  const body = { success: true, actor: '', }

  return resp.success200Obj({ body, cookies: session.clearingCookies(), })
}
