/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import type { Configuration } from '../../configuration.ts'
import type * as Request from '../../request.ts'
import type { Type as Responses } from '../../responses.ts'
import type { APIHandler } from './types.ts'

export const Login: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const { username, password, } = await req.getFormInputs()

  const userinfo = config.database.users()

  // TODO: Make sure username is in the userinfo object somehow.
  if (!await userinfo.exists()) {
    return resp.error404({ info: 'Login', })
  }

  if (!await userinfo.checkPassword(password)) {
    return resp.error404({ info: 'Login', })
  }

  const actorFunc = (arg0: string): string => config.getActorURL(arg0)
  const session = await config.database.newSession(username, actorFunc)

  const body = {
    success : true,
    actor   : config.getActorURL(username),
  }
  const cookies = await session.getCookies()

  return resp.success200Obj({ body, cookies, })
}

export const Verify: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const cookiesIn = await req.getCookieInputs()

  // actinf = username, actinfo = session information.
  const session = await config.database.session(cookiesIn)

  if (!await session.valid()) {
    return resp.error403()
  }

  const body = {
    success : true,
    actor   : session.document()!.actor,
  }
  const cookies = await session.refreshCookies()

  return resp.success200Obj({ body, cookies, })
}

export const Logout: APIHandler = async <DatabaseT, ResponseT>(
  config: Configuration<DatabaseT>,
  req: Request.Helper,
  resp: Responses<ResponseT>,
): Promise<ResponseT> => {
  const url = config.url.toString()

  if (req.canAcceptHTML()) {
    return resp.redirect30x({ url, statusCode: 301, })
  }

  const cookiesIn = await req.getCookieInputs()

  const session = await config.database.session(cookiesIn)

  if (await session.exists()) {
    await session.invalidate()
  }

  const body = { success: true, actor: '', }

  return resp.success200Obj({ body, cookies: session.clearingCookies(), })
}
