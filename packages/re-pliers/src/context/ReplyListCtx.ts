/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'
import type { ReplyList } from '../types/ReplyList.ts'

/** Stores the current cached replies and the index to them. */
const ReplyListCtx: Context<ReplyList> = createContext<ReplyList>({
  replies    : [],
  replyIndex : [],
})

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyListCtx
