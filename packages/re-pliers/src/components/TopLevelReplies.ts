/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext } from 'preact/hooks'
import { ReplyListCtx } from '../context/ReplyListCtx.ts'
import Reply from './Reply.ts'
import type { FunctionComponent } from 'preact'
import type { Types } from '@csjewell-activitypub/general'

/**
 * Displays the top level of replies.
 *
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const TopLevelReplies: FunctionComponent = () => {
  const replyList = useContext<Types.ReplyList>(ReplyListCtx)

  const lastIndex = replyList.replyIndex.length > 0
    ? replyList.replyIndex[replyList.replyIndex.length - 1].index
    : -1

  const list = replyList.replyIndex.map(
    (i: Types.IndexEntry) => {
      return html`
        <${ Reply }
          key=${ i.identifier }
          index=${ i.index }
          indentLevel=1
          needsBottom=${ i.index !== lastIndex }
        />
      `
    },
  )

  return html`${ list }`
}

/* eslint-disable-next-line import-x/no-default-export */
export default TopLevelReplies
