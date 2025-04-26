/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'
import type { ReplyList } from '../types/ReplyList.ts'

/** Stores the current cached replies and the index to them. */
export const ReplyListCtx: Context<ReplyList> = createContext<ReplyList>({
  replies    : [],
  replyIndex : [],
})
