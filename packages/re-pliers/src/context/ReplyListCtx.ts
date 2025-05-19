/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'
import type { Types } from '@csjewell-activitypub/general'

/** Stores the current cached replies and the index to them. */
export const ReplyListCtx: Context<Types.ReplyList> = createContext<Types.ReplyList>({
  replies    : [],
  replyIndex : [],
})
