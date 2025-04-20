/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Context, createContext } from 'preact'
import type AuthInfo from '../types/AuthInfo.ts'

const AuthCtx: Context<AuthInfo> = createContext<AuthInfo>({
  actor      : '',
  isVerified : false,
} as AuthInfo)

/* eslint-disable-next-line import-x/no-default-export */
export default AuthCtx
