/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useEffect, useState } from 'preact/hooks'
import RepliesAPI from '../api/replies.ts'
import ReplyActionsCtx from '../context/ReplyActionsCtx.ts'
import ReplyListCtx from '../context/ReplyListCtx.ts'
import { toReplyList } from '../types/ReplyList.ts'
import type { FunctionComponent } from 'preact'
import type { ReplyActions } from '../types/ReplyActions.ts'
import type { ReplyListCtxType } from '../types/ReplyListCtxType.ts'

/**
 * Provides the list of replies to descendants
 *
 * @param page - The canonical URL of the current page. This URL is used as the
 * ActivityPub identifier of the page.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Replies: FunctionComponent<{ page: string }> = ({ page, children, }) => {
  const [ replyListCtx, setReplyListCtx ] = useState<ReplyListCtxType>({
    replies      : [],
    replyIndex   : [],
    totalReplies : -1,
    start        : 0,
  })

  const replyActions: ReplyActions = {
    like : async (i: number): Promise<void> => {
      const { replies, } = replyListCtx
      const { identifier, } = replies[i]

      await RepliesAPI.doReplyAction(page, identifier, 'like', false)
      replies[i].liked = true
      replies[i].numLikes += 1
      setReplyListCtx({
        ...replyListCtx,
        replies,
      })
    },
    unlike : async (i: number): Promise<void> => {
      const { replies, } = replyListCtx

      const { identifier, } = replies[i]

      await RepliesAPI.doReplyAction(page, identifier, 'like', true)
      replies[i].liked = false
      replies[i].numLikes -= 1
      setReplyListCtx({
        ...replyListCtx,
        replies,
      })
    },
    hide : async (i: number): Promise<void> => {
      const { replies, } = replyListCtx
      const { identifier, } = replies[i]

      await RepliesAPI.doReplyAction(page, identifier, 'hide', false)
      replies[i].isHidden = true
      setReplyListCtx({
        ...replyListCtx,
        replies,
      })
    },
    unhide : async (i: number): Promise<void> => {
      const { replies, } = replyListCtx
      const { identifier, } = replies[i]

      await RepliesAPI.doReplyAction(page, identifier, 'hide', true)
      replies[i].isHidden = false
      setReplyListCtx({
        ...replyListCtx,
        replies,
      })
    },
    reply : async (fd: FormData): Promise<void> => {
      await RepliesAPI.doSubmitReply(page, fd)
      setReplyListCtx({
        ...replyListCtx,
        totalReplies : replyListCtx.totalReplies + 1,
      })
    },
  }

  const getAllPages = async () => {
    let objIn = replyListCtx
    let isLoading = true

    while (isLoading) {
      const objOut = await RepliesAPI.doGetRepliesPage(page, objIn).catch((_error) => {
        throw new Error('Could not load replies')
      })

      if (objOut.replies.length === objOut.totalReplies) {
        isLoading = false
        setReplyListCtx(objOut)
      } else {
        objIn = objOut
      }
    }
  }

  useEffect(() => {
    if (replyListCtx.replies.length === replyListCtx.totalReplies) {
      return
    }

    void getAllPages()
  }, [replyListCtx])
  return html`
    <${ ReplyListCtx.Provider } value=${ () => toReplyList(replyListCtx) }>
      <${ ReplyActionsCtx.Provider } value=${ replyActions }>
        ${ children }
      <//>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Replies
