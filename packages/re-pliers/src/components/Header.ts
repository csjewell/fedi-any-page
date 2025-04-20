/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import InfoCircleOutlined from '@ant-design/icons-svg/es/asn/InfoCircleOutlined'
import LightDarkCtx from '../context/LightDarkCtx.ts'
import Icon from './Icon.ts'
import Info from './Info.ts'
import LightDarkButton from './LightDarkButton.ts'
import type { FunctionComponent } from 'preact'

/**
 * The top-level component of the re-pliers widget.
 *
 * @param user - The user who created the page.
 * @param domain - The domain of the ActivityPub endpoint the user is on.
 * @returns A functional Component to use in JSX or HTM.
 */
const Header: FunctionComponent<{
  user   : string,
  domain : string,
}> = ({ user, domain, children, }) => {
  const lsTheme = localStorage.getItem('re-pliers-theme')
  const isDarkDefault = lsTheme === null ? !window.matchMedia('(prefers-color-scheme: light)').matches : lsTheme === 'dark'
  const [ isDark, setIsDark ] = useState<boolean>(isDarkDefault)
  const [ isInfoBlockOpen, setInfoBlockOpen ] = useState<boolean>(false)

  return html`
    <${ LightDarkCtx.Provider } value=${ isDark }>
      <details class="re-pliers" open data-color=${ isDark ? 'dark' : 'light' }>
        <summary>Federated Replies:</summary>
        <span
          class="clickable"
          style=${ { 'margin-left': '1em', } }
          onClick=${ () => { setInfoBlockOpen(!isInfoBlockOpen) } }
          title="Show more information"
          role="button"
          aria-label="Show more information"
        >
          <${ Icon } icon=${ InfoCircleOutlined } />
        </span>
        <${ LightDarkButton } setIsDark=${ setIsDark } />
        <${ Info } isOpen=${ isInfoBlockOpen } user=${ user } domain=${ domain } />
        <hr />
        ${ children }
      </details>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Header
