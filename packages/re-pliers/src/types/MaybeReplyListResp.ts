/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import * as v from '@valibot/valibot'
import { ErrorRespSchema } from './ErrorResp.ts'
import { ReplyListRespSchema } from './ReplyListResp.ts'

export const MaybeReplyListRespSchema = v.variant('success', [ ReplyListRespSchema, ErrorRespSchema ])

export type MaybeReplyListResp = v.InferOutput<typeof MaybeReplyListRespSchema>

export const validateMaybeReplyListResp = (value: unknown): value is MaybeReplyListResp => {
  return v.is<typeof MaybeReplyListRespSchema>(MaybeReplyListRespSchema, value)
}

type AssertIsMaybeReplyListResp = (value: unknown) => asserts value is MaybeReplyListResp
export const assertMaybeReplyListResp: AssertIsMaybeReplyListResp = (value: unknown) => {
  v.assert<typeof MaybeReplyListRespSchema>(MaybeReplyListRespSchema, value)
}
