/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { html } from 'htm/preact'
import AuthCtx from './context/AuthCtx.ts'
import ReplyActionsCtx from './context/ReplyActionsCtx.ts'
import ReplyListCtx from './context/ReplyListCtx.ts'
import type { VNode } from 'preact'
import type ReplyActions from './types/ReplyActions.ts'
import type ReplyList from './types/ReplyList.ts'

const complicatedRepliesObj: ReplyList = {
  replies : [
    {
      identifier : 'https://mock.response.example.org/12345',
      replyTo    : { username: 'mockery', actorLink: 'https://mock.response.example.org/actor/mockery', },
      date       : new Date(),
      content    : '<p>This is the first reply</p>',
      numLikes   : 1,
      liked      : true,
      replyIndex : [
        {
          index      : 1,
          identifier : 'https://mock.response.example.org/12346',
        },
        {
          index      : 3,
          identifier : 'https://mock.response.example.org/12348',
        },
      ],
    },
    {
      identifier : 'https://mock.response.example.org/12346',
      replyTo    : { username: 'silly', actorLink: 'https://mock.response.example.org/actor/silly', },
      date       : new Date(),
      content    : '<p>This is the first reply to the first reply</p>',
      numLikes   : 1,
      liked      : true,
      replyIndex : [],
    },
    {
      identifier : 'https://mock.response.example.org/12347',
      replyTo    : { username: 'mocked', actorLink: 'https://mock.response.example.org/actor/mockery', },
      date       : new Date(),
      content    : '<p>This is the second reply</p>',
      numLikes   : 1,
      liked      : true,
      replyIndex : [
        {
          index      : 4,
          identifier : 'https://mock.response.example.org/12349',
        },
      ],
    },
    {
      identifier : 'https://mock.response.example.org/12348',
      replyTo    : { username: 'mockery', actorLink: 'https://mock.response.example.org/actor/mockery', },
      date       : new Date(),
      content    : '<p>This is the second reply to the first reply</p>',
      numLikes   : 1,
      liked      : true,
      replyIndex : [],
    },
    {
      identifier : 'https://mock.response.example.org/12349',
      replyTo    : { username: 'silly', actorLink: 'https://mock.response.example.org/actor/silly', },
      date       : new Date(),
      content    : '<p>This is the first reply to the second reply</p>',
      numLikes   : 1,
      liked      : true,
      replyIndex : [],
    },
  ],
  replyIndex : [
    {
      index      : 0,
      identifier : 'https://mock.response.example.org/12345',
    },
    {
      index      : 2,
      identifier : 'https://mock.response.example.org/12347',
    },
  ],
}

const complicatedReplies = (): ReplyList => {
  return complicatedRepliesObj
}

/* eslint-disable @typescript-eslint/require-await -- These are the end of the line. */
const replyActions: ReplyActions = {
  like : async (i: number): Promise<void> => {
    complicatedRepliesObj.replies[i].liked = true
    complicatedRepliesObj.replies[i].numLikes += 1
  },
  unlike : async (i: number): Promise<void> => {
    complicatedRepliesObj.replies[i].liked = false
    complicatedRepliesObj.replies[i].numLikes -= 1
  },
  hide : async (i: number): Promise<void> => {
    complicatedRepliesObj.replies[i].isHidden = true
  },
  unhide : async (i: number): Promise<void> => {
    complicatedRepliesObj.replies[i].isHidden = false
  },
  reply : async (_fd: FormData): Promise<void> => { return },
}
/* eslint-enable @typescript-eslint/require-await */

const noReplies = (): ReplyList => {
  return {
    replies    : [],
    replyIndex : [],
  }
}

const simpleReply = (): ReplyList => {
  return {
    replies : [
      {
        identifier : 'https://mock.response.example.org/12345',
        replyTo    : { username: 'mockery', actorLink: 'https://mock.response.example.org/actor/mockery', },
        date       : new Date(),
        content    : '<p>This is the first reply</p>',
        numLikes   : 1,
        liked      : true,
        replyIndex : [],
        isPrivate  : true,
      },
    ],
    replyIndex : [
      {
        index      : 0,
        identifier : 'https://mock.response.example.org/12345',
      },
    ],
  }
}

const wrapper = (vnode: VNode, isAuthed: boolean, replies: ReplyList): VNode => {
  const auth = {
    actor      : isAuthed ? 'https://mock.response.example.com/actor/mockery' : '',
    isVerified : isAuthed,
  }

  return html`
    <${ AuthCtx.Provider } value=${ auth }>
      <${ ReplyListCtx.Provider } value=${ replies }>
        <${ ReplyActionsCtx.Provider } value=${ replyActions }>
          ${ vnode }
        <//>
      <//>
    <//>
  `
}

export { complicatedReplies, noReplies, simpleReply, wrapper }
