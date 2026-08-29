/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect } from 'preact/hooks'
import { usePersistedSignal } from '@kamod-ch/signals'
import * as AuthAPI from '../api/auth.ts'
import { type AuthInfo, validateAuthInfo } from '../types/AuthInfo.ts'
import LoginButton from './LoginButton.ts'
import LogoutButton from './LogoutButton.ts'
import type { FunctionComponent } from 'preact'

const isLoggedOut: AuthInfo = { actor: '', whenVerified: -1, }

/**
 * Provides authentication info within a context for children.
 *
 * @param page - The canonical URL of the current page. This URL is used as the
 * ActivityPub identifier of the page.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Auth: FunctionComponent<{
  page    : string,
  isTest? : AuthInfo,
}> = ({ page, isTest, children, }) => {
  const authInfo = usePersistedSignal<AuthInfo>('actor_info', isLoggedOut, {
    storage     : 'cookie',
    serialize   : (v: AuthInfo) : string => { return JSON.stringify(v) },
    deserialize : (s: string) : AuthInfo => {
      let value: unknown

      try {
        value = JSON.parse(s)
      } catch {
        // A truncated or otherwise malformed cookie means we are not logged in.
        return isLoggedOut
      }

      return validateAuthInfo(value) ? value : isLoggedOut
    },
    cookie : { expires: 7, path: '/', sameSite: 'Strict', },
  })

  const handleLoggingIn = async (data: FormData) => {
    try {
      const auth = await AuthAPI.doLogin(page, data)

      authInfo.value = auth
    } catch (error) {
      authInfo.value = isLoggedOut
      throw error
    }
  }

  const handleLoggingOut = async () => {
    try {
      await AuthAPI.doLogout(page)
      authInfo.value = isLoggedOut
    } catch (error) {
      authInfo.value = isLoggedOut
      throw error
    }
  }

  useEffect(() => {
    if (isTest) {
      authInfo.value = isTest
      return
    }

    AuthAPI.doVerify(page).then((ret) => {
      authInfo.value = ret
    }).catch((error) => {
      authInfo.value = isLoggedOut
      throw error
    })
  }, [ authInfo, page ])
  return html`
    ${ authInfo.value.actor
      ? html`<${ LogoutButton } onSubmit=${ handleLoggingOut } />`
      : html`<${ LoginButton } onSubmit=${ handleLoggingIn } />` }
    <hr />
    ${ children }
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Auth
