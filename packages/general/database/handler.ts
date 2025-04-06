/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

/*
 */
export type Database<T> = {
  databaseId : () => number | undefined
  document   : () => T | undefined
  remove     : () => Promise<boolean>
  save       : (...arguments_: Array<unknown>) => Promise<boolean>
  exists     : () => Promise<boolean>
  retrieve   : (...arguments_: Array<unknown>) => Promise<T>
  shorten    : () => Promise<{ url: URL | undefined; id: number | undefined }>
}
