/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { grip } from '@nesterow/grip'
import { assertErrorResp } from '../types/ErrorResp.ts'
import { assertReplyListResp } from '../types/ReplyListResp.ts'
import type { ReplyListCtxType } from '../types/ReplyListCtxType.ts'

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
 * @throws ValiError if the correct type of JSON data is not received.
 */
const doGetRepliesPage = async (page: string, replyList: ReplyListCtxType): Promise<ReplyListCtxType> => {
  const repliesURL = `${ new URL(page).origin }/re-pliers-api/replies`
  let ret: ReplyListCtxType

  const resp = await grip(fetch(repliesURL, {
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
  }))

  if (resp.fail()) {
    throw new Error('Error retrieving replies', { cause: resp.status, })
  }

  if (resp.value.status >= 300) {
    const errObj: unknown = await resp.value.json()

    assertErrorResp(errObj)
    throw new Error(errObj.error)
  }

  const obj: unknown = await resp.value.json()

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
  const replyURL = `${ new URL(page).origin }/re-pliers-api/reply`

  const resp = await grip(fetch(replyURL, {
    method      : 'POST',
    body        : JSON.stringify(fd),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    referrer    : '',
  }))

  if (resp.fail()) {
    throw new Error('Error submitting reply', { cause: resp.status, })
  }

  // Should send a 201.
  if (resp.value.status >= 300) {
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
 * @param undo - whether to undo the previous action (to unhide or unlike
 * instead of hiding or liking.)
 * @returns A void Promise.
 * @throws Error (for now) if not successful.
 */
const doReplyAction = async (
  page       : string,
  identifier : string,
  action     : string,
  undo       : boolean,
): Promise<void> => {
  const replyURL = `${ new URL(page).origin }/re-pliers-api/reply/${ action }`

  const resp = await grip(fetch(replyURL, {
    method      : 'POST',
    body        : JSON.stringify({ identifier, undo, }),
    cache       : 'no-store',
    credentials : 'include',
    mode        : 'cors',
    headers     : { 'Content-Type': 'application/json', },
    referrer    : '',
  }))

  if (resp.fail()) {
    throw new Error('Error sending action on reply', { cause: resp.status, })
  }

  // Should be sending a 201 with a { success: true, identifier: "..." },
  // but we do not need either one on the front end.
  if (resp.value.status >= 300) {
    throw new Error(`Error federating ${ action }`)
  }
}

const Replies = { doGetRepliesPage, doReplyAction, doSubmitReply, }

/* eslint-disable-next-line import-x/no-default-export */
export default Replies
