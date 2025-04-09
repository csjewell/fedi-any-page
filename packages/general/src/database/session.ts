/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */


import type { ActorFunc } from './router.ts'

/**
 * Additional methods the session storage needs to implement.
 */
export type SessionStorage<SessionReturnT> = {
  invalidate      : () => Promise<boolean>
  getCookies      : (actorFunc: ActorFunc) => Promise<SessionReturnT>
  valid           : (...arguments_: Array<unknown>) => Promise<boolean>
  refreshCookies  : (actorFunc: ActorFunc) => Promise<SessionReturnT>
  clearingCookies : () => SessionReturnT
}
