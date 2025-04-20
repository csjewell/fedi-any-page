/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import LogoutOutlined from '@ant-design/icons-svg/es/asn/LogoutOutlined'
import Icon from './Icon.ts'
import LogoutModal from './LogoutModal.ts'
import type { FunctionComponent } from 'preact'

/**
 * The button that brings up the log-out modal.
 *
 * @param onSubmit - A function, taking a FormData parameter, to be called when the form is submitted.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LogoutButton: FunctionComponent<{ onSubmit: () => boolean }> = ({
  onSubmit,
}) => {
  const [ isLogoutModalOpen, setLogoutModalOpen ] = useState<boolean>(false)

  const handleLogoutSubmit = () => {
    if (onSubmit()) {
      setLogoutModalOpen(false)
    }
  }

  return html`
    <span
      onClick=${ () => { setLogoutModalOpen(true) } }
      class="clickable"
      title="Logout"
      role="button"
      aria-label="Logout"
    >
      <${ Icon } icon=${ LogoutOutlined } />
    </span>

    <${ LogoutModal }
      isOpen=${ isLogoutModalOpen }
      onSubmit=${ handleLogoutSubmit }
      onClose=${ () => { setLogoutModalOpen(false) } }
    />
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LogoutButton
