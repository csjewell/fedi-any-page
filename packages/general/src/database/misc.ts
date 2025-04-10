/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

/** TODO: Document [2015-4-12] */
export type DBUsername = {
  username   : string | undefined
  usernameId : number | undefined
}

/** TODO: Document [2015-4-12] */
export type DatabaseKey = {
  createKey : () => Promise<void>
}
