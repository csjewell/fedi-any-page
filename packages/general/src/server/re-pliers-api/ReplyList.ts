/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'
import { IndexEntrySchema } from './IndexEntry.ts'
import { type ReplyInfo, ReplyInfoSchema } from './ReplyInfo.ts'
import type { ReplyListCtxType } from './ReplyListCtxType.ts'
import type { ReplyListResp } from './ReplyListResp.ts'

/**
 * A list of replies, retrieved from an external source.
 *
 * Contains the `replies` and `replyIndex` properties from a {@link ReplyListResp}.
 */
export const ReplyListSchema = v.strictObject({
  replies    : v.array(ReplyInfoSchema),
  replyIndex : v.array(IndexEntrySchema),
})

export type ReplyList = v.InferOutput<typeof ReplyListSchema>

/**
 * Converts a {@link ReplyListResp} or a {@link ReplyListCtxType} to a {@link ReplyList}.
 *
 * The `date` property on each reply is normalized as the conversion is done.
 *
 * @param value - The value to be converted.
 * @returns A ReplyList.
 */
export const toReplyList = (value: ReplyListResp | ReplyListCtxType): ReplyList => {
  return {
    replies    : value.replies.map((r): ReplyInfo => v.parse(ReplyInfoSchema, r)),
    replyIndex : value.replyIndex,
  }
}
