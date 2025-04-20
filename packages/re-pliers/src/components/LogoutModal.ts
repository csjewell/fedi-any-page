/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect, useRef } from 'preact/hooks'
import Modal from './Modal.ts'
import type { FunctionComponent } from 'preact'

/**
 * The button that brings up the log-out modal.
 *
 * @param isOpen - Is the modal open?
 * @param onSubmit - A function to be called when the form is submitted.
 * @param onClose - A function to be called when the form is to be closed.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LogoutModal: FunctionComponent<{
  isOpen   : boolean
  onSubmit : () => void
  onClose  : () => void
}> = ({ isOpen, onSubmit, onClose, }) => {
  const focusRef = useRef<HTMLButtonElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen && focusRef.current) {
      setTimeout(() => {
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We just checked for that! */
        focusRef.current!.focus()
      }, 0)
    }
  }, [isOpen])

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    onSubmit()
  }

  const handleClose = (e: Event) => {
    e.preventDefault()
    onClose()
  }

  return html`
    <${ Modal } hasCloseBtn=${ true } isOpen=${ isOpen } onClose=${ handleClose }>
      <form ref=${ formRef } onSubmit=${ handleSubmit }>
        <p>Do you wish to log out?</p>
        <p class="error" ref=${ errorRef }></p>
        <button type="submit" ref=${ focusRef }>Log Out</button>
      </form>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LogoutModal
