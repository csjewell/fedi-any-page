/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

type ActorFunc = (username: string) => string

export type Session<T> = {
  invalidate      : () => Promise<boolean>
  getCookies      : (actorFunc: ActorFunc) => Promise<T>
  valid           : (...arguments_: Array<unknown>) => Promise<void>
  refreshCookies  : (actorFunc: ActorFunc) => Promise<T>
  clearingCookies : () => T
}
