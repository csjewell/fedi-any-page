/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { grip } from '@nesterow/grip'
import { assertAuthResp } from '../types/AuthResp.ts'
import { assertErrorResp } from '../types/ErrorResp.ts'
import type { AuthInfo } from '../types/AuthInfo.ts'

/**
 * A library for simple authentication.
 *
 * @packageDocumentation
 */

/**
 * Log in to the remote server.
 *
 * @param page - The canonical URL of the current page.
 * @param data - The data from the login form.
 * @param data.username - The username being used to log in.
 * @param data.password - The password being used to log in.
 * @returns A Promise containing an AuthInfo instance with authentication information.
 * @throws Error (for now) if not successful.
 * @throws ValiError if the correct type of JSON data is not received.
 */
export const doLogin = async (page: string, data: FormData): Promise<AuthInfo> => {
  const api = `${ new URL(page).origin }/re-pliers-api/login`

  const resp = await grip(fetch(api, {
    method      : 'POST',
    body        : JSON.stringify(data),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    redirect    : 'error',
    referrer    : '',
  }))

  if (resp.fail()) {
    throw new Error('Error logging in', { cause: resp.status, })
  }

  if (resp.value.status < 300) {
    const obj = await resp.value.json()

    assertAuthResp(obj)
    return {
      actor      : obj.actor,
      isVerified : true,
    }
  }

  const errObj = await resp.value.json()

  assertErrorResp(errObj)
  throw new Error(errObj.error)
}

/**
 * Log out of the remote server.
 *
 * @param page - The canonical URL of the current page.
 * @returns A void Promise if successful.
 * @throws Error (for now) if not successful.
 */
export const doLogout = async (page: string): Promise<void> => {
  const api = `${ new URL(page).origin }/re-pliers-api/logout`

  const resp = await grip(() => fetch(api, {
    method      : 'POST',
    body        : JSON.stringify({ logout: true, }),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    redirect    : 'error',
    referrer    : '',
  }))

  if (resp.fail()) {
    throw new Error('Error attempting to logout', { cause: resp.status, })
  }

  if (resp.value.status >= 300) {
    // We throw a better error later.
    throw new Error(`Logging out returned ${ resp.value.status.toFixed(0) }`)
  }
}

/**
 * Verify whether the session information in the cookie is valid on the remote server.
 *
 * @param page - The canonical URL of the current page.
 * @returns A Promise containing an AuthInfo instance with authentication information.
 * @throws Error (for now) if not successful.
 * @throws ValiError if the correct type of JSON data is not received.
 */
export const doVerify = async (page: string): Promise<AuthInfo> => {
  const api = `${ new URL(page).origin }/re-pliers-api/verify`
  const resp = await grip(fetch(api, {
    method      : 'POST',
    body        : JSON.stringify({}),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    redirect    : 'error',
    referrer    : '',
  }))

  if (resp.fail()) {
    throw new Error('Error attempting to logout', { cause: resp.status, })
  }

  if (resp.value.status < 300) {
    const obj = await resp.value.json()

    assertAuthResp(obj)
    return { actor: obj.actor, isVerified: true, }
  }

  const errObj = await resp.value.json()

  assertErrorResp(errObj)
  throw new Error(errObj.error)
}
