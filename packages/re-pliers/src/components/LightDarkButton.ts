/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext } from 'preact/hooks'
import MoonOutlined from '@ant-design/icons-svg/es/asn/MoonOutlined'
import SunOutlined from '@ant-design/icons-svg/es/asn/SunOutlined'
import { LightDarkCtx } from '../context/LightDarkCtx.ts'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'

/**
 * The button that switches between light mode and dark mode.
 *
 * @param setIsDark - Function provided by props to switch the context.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LightDarkButton: FunctionComponent<{ setIsDark: (b: boolean) => void }> = ({ setIsDark, }) => {
  const isDark = useContext<boolean>(LightDarkCtx)

  const setDark = () => {
    setIsDark(true)
    localStorage.setItem('re-pliers-theme', 'dark')
  }

  const setLight = () => {
    setIsDark(false)
    localStorage.setItem('re-pliers-theme', 'light')
  }

  return html`
    <span
      class="clickable"
      onClick=${ isDark ? setLight : setDark }
      title="${ isDark ? 'Light' : 'Dark' } Mode"
      role="button"
      aria-label="${ isDark ? 'Light' : 'Dark' } Mode"
    >
      <${ Icon } icon=${ isDark ? SunOutlined : MoonOutlined } />
    </span>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LightDarkButton
