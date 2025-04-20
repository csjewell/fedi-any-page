/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useState } from 'preact/hooks'
import LoginOutlined from '@ant-design/icons-svg/es/asn/LoginOutlined'
import Icon from './Icon.ts'
import LoginModal from './LoginModal.ts'
import type { FunctionComponent } from 'preact'

/**
 * The button that brings up the log-in modal.
 *
 * @param onSubmit - A function, taking a FormData parameter, to be called when the form is submitted.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LoginButton: FunctionComponent<{ onSubmit: (fd: FormData) => void }> = ({ onSubmit, }) => {
  const [ isLoginModalOpen, setLoginModalOpen ] = useState<boolean>(false)

  return html`
    <span
      onClick="${ () => { setLoginModalOpen(true) } }"
      class="clickable"
      title="Login"
      role="button"
      aria-label="Login"
    >
      <${ Icon } icon=${ LoginOutlined } />
    </span>

    <${ LoginModal }
      isOpen=${ isLoginModalOpen }
      onClose=${ () => { setLoginModalOpen(false) } }
      onSubmit=${ onSubmit }
    />
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LoginButton
