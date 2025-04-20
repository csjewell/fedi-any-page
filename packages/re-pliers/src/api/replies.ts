/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { assertErrorResp } from '../types/ErrorResp.ts'
import { assertReplyListResp } from '../types/ReplyListResp.ts'
import type ReplyListCtxType from '../types/ReplyListCtxType.ts'

/**
 * A library for sending replies and information about them to a remote server
 * in order to federate them.
 *
 * @packageDocumentation
 */

/**
 * Retrieve (more) replies.
 *
 * @param page - The canonical URL of the current page. This is used as an
 * ActivityPub identifier.
 * @param replyList - The current information about replies to the page.
 * @returns A Promise containing an AuthInfo instance with updated reply information.
 * @throws Error (for now) if not successful.
 */
const doGetRepliesPage = async (page: string, replyList: ReplyListCtxType): Promise<ReplyListCtxType> => {
  let ret: ReplyListCtxType

  const resp = await fetch(`${ new URL(page).origin }/re-pliers-api/replies`, {
    method : 'POST',
    body   : JSON.stringify({
      page,
      start : replyList.start,
    }),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    referrer    : '',
  })

  if (resp.status < 300) {
    const obj: unknown = await resp.json()

    assertReplyListResp(obj)

    if (replyList.start === 0) {
      ret = {
        replies      : obj.replies,
        replyIndex   : obj.replyIndex,
        totalReplies : obj.totalReplies,
        start        : obj.nextPage ?? 0,
      }
    } else {
      ret = {
        replies      : [ ...replyList.replies, ...obj.replies ],
        replyIndex   : [ ...replyList.replyIndex, ...obj.replyIndex ],
        totalReplies : obj.totalReplies,
        start        : obj.nextPage ?? 0,
      }
    }
  } else {
    const obj: unknown = await resp.json()

    assertErrorResp(obj)
    throw new Error(obj.error)
  }

  return ret
}

/**
 * Submit a reply.
 *
 * @param page - The canonical URL of the current page. This is used as an
 * ActivityPub identifier.
 * @param fd - The reply form.
 * @returns A void Promise.
 * @throws Error (for now) if not successful.
 */
const doSubmitReply = async (page: string, fd: FormData): Promise<void> => {
  const resp = await fetch(`${ new URL(page).origin }/re-pliers-api/reply`, {
    method      : 'POST',
    body        : JSON.stringify(fd),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    referrer    : '',
  })

  // Should send a 201.
  if (resp.status >= 300) {
    throw new Error('Error sending reply')
  }
}

/**
 * Perform an action on a reply.
 *
 * @param page - The canonical URL of the current page.
 * @param identifier - The ActivityPub identifier being operated on.
 * @param string - The action being taken ('hide' or 'like'). Hide is a local
 * action, while 'like' is a federated one.
 * @param undo - whether to undo the previous action (to unhide or unlike instead
 * of hiding or liking.)
 * @returns A void Promise.
 * @throws Error (for now) if not successful.
 */
const doReplyAction = async (page: string, identifier: string, action: string, undo: boolean): Promise<void> => {
  try {
    const resp = await fetch(`${ new URL(page).origin }/re-pliers-api/reply/${ action }`, {
      method      : 'POST',
      body        : JSON.stringify({ identifier, undo, }),
      cache       : 'no-store',
      credentials : 'include',
      mode        : 'cors',
      headers     : { 'Content-Type': 'application/json', },
      referrer    : '',
    })

    // Should be sending a 201 with a { success: true, identifier: "..." },
    // but we do not need either one on the front end.
    if (resp.status >= 300) {
      throw new Error(`Error federating ${ action }`)
    }
  } catch (error) {
    // console.log(err)
    throw new Error('Error sending action on reply', { cause: error, })
  }
}

const Replies = { doGetRepliesPage, doReplyAction, doSubmitReply, }

/* eslint-disable-next-line import-x/no-default-export */
export default Replies
