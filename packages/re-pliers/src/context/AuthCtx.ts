/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'
import type { AuthInfo } from '../types/AuthInfo.ts'

/** Stores the current authentication information. */
export const AuthCtx: Context<AuthInfo> = createContext<AuthInfo>({
  actor        : '',
  whenVerified : -1,
})
