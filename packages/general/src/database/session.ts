/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */


import type { ActorFunc, StorageHandler } from './router.ts'

export type SessionStorage<SessionReturnT> = StorageHandler<SessionReturnT> & SessionStorageFuncs<SessionReturnT>

/**
 * Additional methods the session storage needs to implement.
 */
export type SessionStorageFuncs<SessionReturnT> = {
  invalidate      : () => Promise<boolean>
  getCookies      : (actorFunc: ActorFunc) => Promise<SessionReturnT>
  valid           : (...arguments_: Array<unknown>) => Promise<boolean>
  refreshCookies  : (actorFunc: ActorFunc) => Promise<SessionReturnT>
  clearingCookies : () => SessionReturnT
}
