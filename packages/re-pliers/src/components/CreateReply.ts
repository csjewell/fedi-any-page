/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext, useRef } from 'preact/hooks'
import CloseCircleOutlined from '@ant-design/icons-svg/es/asn/CloseCircleOutlined'
import InfoCircleOutlined from '@ant-design/icons-svg/es/asn/InfoCircleOutlined'
import SendOutlined from '@ant-design/icons-svg/es/asn/SendOutlined'
import ReplyActionsCtx from '../context/ReplyActionsCtx.ts'
import Icon from './Icon.ts'
import MarkdownIcon from './MarkdownIcon.ts'
import type { FunctionComponent } from 'preact'
import type ReplyActions from '../types/ReplyActions.ts'

/**
 * The form to send a reply out.
 *
 * @param isHidden - Is this component hidden at the present time?
 * @param identifier - The ActivityPub object being replied to.
 * @param isPrivateOnly - Was the object being replied to private?
 * @param closeReply - A function, passed down as a property, to close the form.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const CreateReply: FunctionComponent<{
  isHidden      : boolean
  identifier    : string
  isPrivateOnly : boolean
  closeReply    : () => void
}> = ({ isHidden, identifier, isPrivateOnly, closeReply, }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const replyActions = useContext<ReplyActions>(ReplyActionsCtx)

  const sendReply = async () => {
    await replyActions.reply(new FormData(formRef.current ?? undefined))
    closeReply()
  }

  if (isHidden) {
    return html``
  }

  return html`
    <form class="create-reply" ref=${ formRef }>
      <span class="clickable" id="mdinfo">
        <${ MarkdownIcon } />
        <${ Icon } icon=${ InfoCircleOutlined } />
      </span>
      <span style="position: relative;">
        <textarea
          id="replyMarkDown"
          name="replyMarkDown"
          rows="5"
          cols="80"
          maxlength=2000
          wrap="soft"
          required
        /><br />
        <${ MarkdownIcon } size="1.5em" className="markdown" />
      </span>
      <input type="hidden" name="replyTo" value=${ identifier } />
      ${ isPrivateOnly
          ? html`<input type="hidden" name="replyType" value="2" />`
          : html`
          <select id="replyType" name="replyType" required>
            <option value="0">Public</option>
            <option value="1">Followers + Mentioned Only</option>
            <option value="2">Private + Mentioned</option>
          </select>
        `
      }
      <span
        class="create-reply-button clickable"
        role="button"
        aria-label="Send"
        onClick=${ sendReply }
      >
        <${ Icon } icon=${ SendOutlined } />
      </span>
      <span
        class="create-reply-button clickable"
        role="button"
        aria-label="Close"
        onClick=${ closeReply }
      >
        <${ Icon } icon=${ CloseCircleOutlined } />
      </span>
    </form>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default CreateReply
