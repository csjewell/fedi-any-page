/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext } from 'preact/hooks'
import EyeInvisibleFilled from '@ant-design/icons-svg/es/asn/EyeInvisibleFilled'
import EyeInvisibleOutlined from '@ant-design/icons-svg/es/asn/EyeInvisibleOutlined'
import ReplyActionsCtx from '../context/ReplyActionsCtx.ts'
import ReplyListCtx from '../context/ReplyListCtx.ts'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'
import type ReplyActions from '../types/ReplyActions.ts'
import type ReplyList from '../types/ReplyList.ts'

/**
 * The button to hide a reply.
 *
 * @param index - The index into the ReplyList that we want to hide.
 * @param hide - A function, passed down as a property, to switch the button state.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const HideReply: FunctionComponent<{
  index : number
  hide  : () => void
}> = ({ index, hide, }) => {
  const replyActions = useContext<ReplyActions>(ReplyActionsCtx)
  const replyList = useContext<ReplyList>(ReplyListCtx)
  const reply = replyList.replies.at(index)

  const hideReply = async () => {
    await replyActions.hide(index)
    hide()
  }

  if (reply === undefined) {
    return html`
      <span title="Cannot hide this reply just yet...">
        <${ Icon } icon=${ EyeInvisibleFilled } />
      </span>
    `
  }

  return html`
    <span
      class="clickable"
      onClick=${ hideReply }
      title="Hide reply"
      role="button"
      aria-label="Hide reply"
    >
      <${ Icon } icon=${ EyeInvisibleOutlined } />
    </span>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default HideReply
