/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext } from 'preact/hooks'
import EyeFilled from '@ant-design/icons-svg/es/asn/EyeFilled'
import EyeOutlined from '@ant-design/icons-svg/es/asn/EyeOutlined'
import { ReplyActionsCtx } from '../context/ReplyActionsCtx.ts'
import { ReplyListCtx } from '../context/ReplyListCtx.ts'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'
import type { Types } from '@csjewell-activitypub/general'
import type { ReplyActions } from '../types/ReplyActions.ts'

/**
 * Displays the button to unhide a reply.
 *
 * @param index - The reply to unhide.
 * @param unhide - A function to call to unhide the reply.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const UnhideReply: FunctionComponent<{
  index  : number
  unhide : () => void
}> = ({ index, unhide, }) => {
  const replyActions = useContext<ReplyActions>(ReplyActionsCtx)
  const replyList = useContext<Types.ReplyList>(ReplyListCtx)
  const reply = replyList.replies.at(index)

  const unhideReply = async () => {
    await replyActions.unhide(index)
    unhide()
  }

  if (reply === undefined) {
    return html`
      <span title="Cannot unhide this reply just yet...">
        <${ Icon } icon=${ EyeFilled } />
      </span>
    `
  }

  return html`
    <span
      class="clickable"
      onClick=${ unhideReply }
      title="Unhide reply"
      role="button"
      aria-label="Unhide reply"
    >
      <${ Icon } icon=${ EyeOutlined } />
    </span>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default UnhideReply
