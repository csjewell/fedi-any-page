/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'
/* eslint "import-x/no-duplicates": "off" -- needed the type and a named import. */
import { IndexEntrySchema } from './IndexEntry.ts'
import { ReplyInfoSchema } from './ReplyInfo.ts'
import type { ReplyListResp } from './ReplyListResp.ts'

export const ReplyListCtxTypeSchema = v.strictObject({
  replies      : v.array(ReplyInfoSchema),
  replyIndex   : v.array(IndexEntrySchema),
  start        : v.pipe(v.number(), v.integer(), v.gtValue(-1)),
  totalReplies : v.pipe(v.number(), v.integer(), v.gtValue(-1)),
})

export type ReplyListCtxType = v.InferOutput<typeof ReplyListCtxTypeSchema>

export const toReplyListCtxType = (value: ReplyListResp): ReplyListCtxType => {
  return {
    //      replies: value.replies.map((r): ReplyInfo => {
    //        const ri: ReplyInfo = { ...r }

    //        ri.date = new Date(r.date)

    //        return ri
    //      }),

    replies      : value.replies,
    replyIndex   : value.replyIndex,
    start        : value.start,
    totalReplies : value.totalReplies,
  }
}
