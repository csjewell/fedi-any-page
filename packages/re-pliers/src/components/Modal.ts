/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect, useRef } from 'preact/hooks'
import CloseOutlined from '@ant-design/icons-svg/es/asn/CloseOutlined'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'

/**
 * The basic definition of a modal dialog.
 *
 * @param isOpen - Is the modal dialog open?
 * @param hasCloseButton - Does the dialog have a close button?
 * @param onClose - Function passed in to be executed on closing the modal.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Modal: FunctionComponent<{
  isOpen      : boolean
  hasCloseBtn : boolean
  onClose?    : () => void
}> = ({ isOpen, hasCloseBtn, onClose, children, }) => {
  const modalRef = useRef<HTMLDialogElement>(null)

  const handleCloseModal = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCloseModal()
    }
  }

  useEffect(() => {
    const modalElement = modalRef.current

    if (!modalElement) {
      return
    }

    if (isOpen) {
      modalElement.showModal()
    } else {
      modalElement.close()
    }
  }, [isOpen])
  return html`
    <dialog
      ref=${ modalRef }
      onKeyDown=${ handleKeyDown }
      class="modal"
      aria-modal="true"
    >
      ${ hasCloseBtn
      && html`
        <button
          class="modal-close-btn"
          onClick=${ handleCloseModal }
          title="Close"
          aria-label="Close"
        >
          <${ Icon } icon=${ CloseOutlined } />
        </button>
      ` }
      ${ children }
    </dialog>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Modal
