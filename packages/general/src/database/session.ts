/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

import type { ActorFunc, StorageHandler } from './router.ts'

/** TODO: Document */
export type SessionStorage<SessionReturnT> = StorageHandler<SessionReturnT> & SessionStorageFuncs<SessionReturnT>

/**
 * Additional methods the session storage needs to implement.
 */
export type SessionStorageFuncs<SessionReturnT> = {
  /** Invalidates the current session */
  invalidate      : () => Promise<boolean>
  /** Get a representation of what the cookies should be for the current session */
  getCookies      : (actorFunc: ActorFunc) => Promise<SessionReturnT>
  /** Is the current session valid? */
  valid           : (...args: Array<unknown>) => Promise<boolean>
  /** Refresh the current session and return what the cookies should be */
  refreshCookies  : (actorFunc: ActorFunc) => Promise<SessionReturnT>
  /** Return a representation of what the cookies should be that should clear them. */
  clearingCookies : () => SessionReturnT
}
