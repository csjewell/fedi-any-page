/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'
import type ReplyActions from '../types/ReplyActions.ts'

/* eslint "@typescript-eslint/no-empty-function": "off" -- Need empty functions here */
const ReplyActionsCtx: Context<ReplyActions> = createContext<ReplyActions>({
  like   : async (_i: number): Promise<void> => {},
  unlike : async (_i: number): Promise<void> => {},
  hide   : async (_i: number): Promise<void> => {},
  unhide : async (_i: number): Promise<void> => {},
  reply  : async (_fd: FormData): Promise<void> => {},
})

/* eslint-disable-next-line import-x/no-default-export */
export default ReplyActionsCtx
