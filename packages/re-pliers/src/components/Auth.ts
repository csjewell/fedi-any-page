/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks'
import * as AuthAPI from '../api/auth.ts'
import { Cookies } from './Cookies.ts'
import { AuthCtx } from '../context/AuthCtx.ts'
import LoginButton from './LoginButton.ts'
import LogoutButton from './LogoutButton.ts'
import type { FunctionComponent } from 'preact'
import type { AuthInfo } from '../types/AuthInfo.ts'

const isLoggedOut: AuthInfo = { actor: '', isVerified: true, }

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
  const [ authInfo, setAuthInfo ] = useState<AuthInfo>(isLoggedOut)

  const handleLoggingIn = async (data: FormData) => {
    try {
      const auth = await AuthAPI.doLogin(page, data)

      setAuthInfo(auth)
    } catch (error) {
      setAuthInfo(isLoggedOut)
      throw error
    }
  }

  const handleLoggingOut = async () => {
    try {
      await AuthAPI.doLogout(page)
      setAuthInfo({ actor: '', isVerified: true, })
    } catch (error) {
      setAuthInfo(isLoggedOut)
      throw error
    }
  }

  useEffect(() => {
    if (isTest) {
      setAuthInfo(isTest)
      return
    }

    if (authInfo.actor === '' && Cookies.get('actor_info') === undefined) {
      setAuthInfo(isLoggedOut)
      return
    }

    AuthAPI.doVerify(page).then((ret) => {
      setAuthInfo(ret)
    }).catch((error) => {
      setAuthInfo(isLoggedOut)
      throw error
    })
  }, [ authInfo, page ])
  return html`
    <${ AuthCtx.Provider } value=${ authInfo }>
      ${ authInfo.actor
        ? html`<${ LogoutButton } onSubmit=${ handleLoggingOut } />`
        : html`<${ LoginButton } onSubmit=${ handleLoggingIn } />` }
      <hr />
      ${ children }
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Auth
