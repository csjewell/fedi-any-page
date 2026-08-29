/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import MoonOutlined from '@ant-design/icons-svg/es/asn/MoonOutlined'
import SunOutlined from '@ant-design/icons-svg/es/asn/SunOutlined'
import { usePersistedSignal } from '@kamod-ch/signals'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'

/**
 * The button that switches between light mode and dark mode.
 *
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LightDarkButton: FunctionComponent<{ setIsDark: (b: boolean) => void }> = () => {
  const isDark = usePersistedSignal<boolean>('re-pliers-theme', true, {
    storage : 'session',
  })

  const setDark = () => {
    isDark.value = true
  }

  const setLight = () => {
    isDark.value = false
  }

  return html`
    <span
      class="clickable"
      onClick=${ isDark.value ? setLight : setDark }
      title="${ isDark.value ? 'Light' : 'Dark' } Mode"
      role="button"
      aria-label="${ isDark.value ? 'Light' : 'Dark' } Mode"
    >
      <${ Icon } icon=${ isDark.value ? SunOutlined : MoonOutlined } />
    </span>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LightDarkButton
