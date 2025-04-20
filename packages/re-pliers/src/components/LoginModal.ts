/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect, useRef } from 'preact/hooks'
import Modal from './Modal.ts'
import type { FunctionComponent } from 'preact'

/**
 * The button that brings up the log-in modal.
 *
 * @param isOpen - Is the modal open?
 * @param onSubmit - A function, taking a FormData parameter, to be called when the form is submitted.
 * @param onClose - A function to be called when the form is closed.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LoginModal: FunctionComponent<{
  isOpen   : boolean
  onSubmit : (fd: FormData) => void
  onClose  : () => void
}> = ({ isOpen, onSubmit, onClose, }) => {
  const focusInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && focusInputRef.current !== null) {
      setTimeout(() => {
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We just checked for that! */
        focusInputRef.current!.focus()
      }, 0)
    }
  }, [isOpen])

  const handleSubmit = (e: Event): void => {
    onSubmit(new FormData(e.currentTarget as HTMLFormElement))
  }

  return html`
    <${ Modal } hasCloseBtn=${ true } isOpen=${ isOpen } onClose=${ () => { onClose() } }>
      <form onSubmit=${ handleSubmit }>
        <div class="form-row">
          <label htmlFor="username">Username:</label>
          <input
            ref=${ focusInputRef }
            type="text"
            id="username"
            name="username"
            required
          />
        </div>
        <div class="form-row">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div class="form-row">
          <button type="submit">Submit</button>
        </div>
      </form>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LoginModal
