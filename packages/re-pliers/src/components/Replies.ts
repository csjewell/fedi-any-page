/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import { Server } from '@csjewell-activitypub/general'
import * as RepliesAPI from '../api/replies.ts'
import { AuthCtx } from '../context/AuthCtx.ts'
import { ReplyActionsCtx } from '../context/ReplyActionsCtx.ts'
import { ReplyListCtx } from '../context/ReplyListCtx.ts'
import type { FunctionComponent } from 'preact'
import type { AuthInfo } from '../types/AuthInfo.ts'
import type { ReplyActions } from '../types/ReplyActions.ts'

/**
 * Provides the list of replies to descendants
 *
 * @param page - The canonical URL of the current page. This URL is used as the
 * ActivityPub identifier of the page.
 * @param cache - Initial not-logged-in cache of the page values.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Replies: FunctionComponent<{
  page  : string,
  cache : Server.RePliers.ReplyListCtxType
}> = ({ page, cache, children, }) => {
  const auth = useContext<AuthInfo>(AuthCtx)

  const [ replyListCtx, setReplyListCtx ] = useState<
    Server.RePliers.ReplyListCtxType
  >(Server.RePliers.UnfilledCache)

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
    if (auth.whenVerified === -1 || auth.actor === '') {
      setReplyListCtx(cache)
    }

    if (replyListCtx.replies.length === replyListCtx.totalReplies) {
      return
    }

    void getAllPages()
  }, [replyListCtx])
  return html`
    <${ ReplyListCtx.Provider } value=${ Server.RePliers.toReplyList(replyListCtx) }>
      <${ ReplyActionsCtx.Provider } value=${ replyActions }>
        ${ children }
      <//>
    <//>
  `
}

/* eslint-disable-next-line import-x/no-default-export */
export default Replies
