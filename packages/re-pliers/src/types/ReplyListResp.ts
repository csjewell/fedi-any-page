/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from 'valibot'
import { IndexEntrySchema } from './IndexEntry.ts'
import { ReplyInfoSchema } from './ReplyInfo.ts'

export const ReplyListRespSchema = v.strictObject({
  success      : v.literal(true),
  replies      : v.array(ReplyInfoSchema),
  replyIndex   : v.array(IndexEntrySchema),
  start        : v.pipe(v.number(), v.integer(), v.gtValue(-1)),
  totalReplies : v.pipe(v.number(), v.integer(), v.gtValue(-1)),
  nextPage     : v.optional(v.pipe(v.number(), v.integer(), v.gtValue(-1))),
})

type ReplyListResp = v.InferOutput<typeof ReplyListRespSchema>

export const verifyReplyListResp = (value: unknown): value is ReplyListResp => {
  return v.is<typeof ReplyListRespSchema>(ReplyListRespSchema, value)
}

type AssertIsReplyListResp = (value: unknown) => asserts value is ReplyListResp
export const assertReplyListResp: AssertIsReplyListResp = (value: unknown) => {
  v.assert<typeof ReplyListRespSchema>(ReplyListRespSchema, value)
}

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyListResp
