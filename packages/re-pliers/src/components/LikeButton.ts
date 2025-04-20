/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext, useState } from 'preact/hooks'
import LikeFilled from '@ant-design/icons-svg/es/asn/LikeFilled'
import LikeOutlined from '@ant-design/icons-svg/es/asn/LikeOutlined'
import ReplyActionsCtx from '../context/ReplyActionsCtx.ts'
import ReplyListCtx from '../context/ReplyListCtx.ts'
import Icon from './Icon.ts'
import type { FunctionComponent } from 'preact'
import type ReplyActions from '../types/ReplyActions.ts'
import type ReplyList from '../types/ReplyList.ts'

/**
 * The button that likes (or undoes a like) for a reply.
 *
 * @param index - The index of the reply to like or unlike.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const LikeButton: FunctionComponent<{ index: number }> = ({ index, }) => {
  const [ shouldRender, setShouldRender ] = useState<boolean>(false)
  const replyActions = useContext<ReplyActions>(ReplyActionsCtx)
  const replyList = useContext<ReplyList>(ReplyListCtx)
  const reply = replyList.replies[index]

  const forceRendering = () => {
    setShouldRender(!shouldRender)
  }

  const like = async () => {
    await replyActions.like(index)
    forceRendering()
  }

  const unlike = async () => {
    await replyActions.unlike(index)
    forceRendering()
  }

  return html`
    <span
      class="clickable"
      onClick=${ reply.liked ? unlike : like }
      title=${ reply.liked ? 'Undo like' : 'Like' }
      role="button"
      aria-label=${ reply.liked ? 'Undo like' : 'Like' }
    >
      ${ reply.numLikes }<${ Icon } icon=${ reply.liked ? LikeFilled : LikeOutlined } />
    </span>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default LikeButton
